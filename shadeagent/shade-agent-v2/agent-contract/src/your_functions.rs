use crate::*;

// Write your own functions here

// Request a signature for a transaction payload if its a valid agent
#[near]
impl Contract {
    pub fn request_signature(
        &mut self,
        path: String,
        payload: String,
        key_type: String,
    ) -> Promise {
        // Require the caller to be a valid agent, panic if not
        if let Some(failure_promise) = self.require_valid_agent() {
            return failure_promise;
        }

        self.internal_request_signature(path, payload, key_type)
    }

    // ===== REPO MANAGEMENT =====

    // Register a GitHub repo and its NEAR maintainer account
    // Only call once per repo — panics if already registered
    pub fn register_repo(&mut self, repo_id: String, maintainer_id: AccountId) {
        require!(
            !self.repo_maintainers.contains_key(&repo_id),
            "Repo already registered"
        );
        self.repo_maintainers.insert(repo_id, maintainer_id);
    }

    // Check if a repo is registered
    pub fn is_repo_registered(&self, repo_id: String) -> bool {
        self.repo_maintainers.contains_key(&repo_id)
    }

    // Get the maintainer of a repo
    pub fn get_repo_maintainer(&self, repo_id: String) -> AccountId {
        self.repo_maintainers
            .get(&repo_id)
            .expect("Repo not registered")
            .clone()
    }

    // ===== BOUNTY MANAGEMENT =====

    // Maintainer deposits NEAR into the bounty pool for their repo
    #[payable]
    pub fn fund_bounty(&mut self, repo_id: String) {
        let maintainer = self
            .repo_maintainers
            .get(&repo_id)
            .expect("Repo not registered");
        require!(
            env::predecessor_account_id() == *maintainer,
            "Only the repo maintainer can fund the bounty"
        );

        let amount = env::attached_deposit().as_yoctonear();
        let current = *self.bounties.get(&repo_id).unwrap_or(&0);
        self.bounties.insert(repo_id, current + amount);
    }

    // Get the current bounty balance for a repository
    pub fn get_bounty(&self, repo_id: String) -> U128 {
        U128(*self.bounties.get(&repo_id).unwrap_or(&0))
    }

    // Agent releases bounty to a contributor after approved review
    pub fn release_bounty(
        &mut self,
        repo_id: String,
        recipient: AccountId,
        amount: U128,
    ) -> Promise {
        // Require the caller to be a valid agent, panic if not
        if let Some(failure_promise) = self.require_valid_agent() {
            return failure_promise;
        }

        require!(
            self.repo_maintainers.contains_key(&repo_id),
            "Repo not registered"
        );

        let bounty = *self
            .bounties
            .get(&repo_id)
            .expect("No bounty funds for repo");
        require!(bounty >= amount.0, "Insufficient bounty funds");

        self.bounties.insert(repo_id, bounty - amount.0);

        Promise::new(recipient).transfer(NearToken::from_yoctonear(amount.0))
    }

    // Maintainer withdraws their remaining bounty funds
    pub fn withdraw_bounty(&mut self, repo_id: String, amount: U128) -> Promise {
        let maintainer = self
            .repo_maintainers
            .get(&repo_id)
            .expect("Repo not registered");
        require!(
            env::predecessor_account_id() == *maintainer,
            "Only the repo maintainer can withdraw the bounty"
        );

        let bounty = *self
            .bounties
            .get(&repo_id)
            .expect("No bounty funds for repo");
        require!(bounty >= amount.0, "Insufficient bounty funds");

        self.bounties.insert(repo_id, bounty - amount.0);

        Promise::new(maintainer.clone()).transfer(NearToken::from_yoctonear(amount.0))
    }
}
