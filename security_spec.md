# Firebase Security Specification (TDD)

## 1. Data Invariants
- **UserProfile Safety**: Users can only write/modify their own profile matching their authenticated `uid`. The `points` field or `role` fields cannot be self-modified by normal users if designated as restricted.
- **BloodRequest Safety**: Only an authenticated user can broadcast or register a blood request. No patient can create a blood request on behalf of another user's identity.
- **Message Safety**: Messages inside a request can only be read/written by patients or matched donors relevant to that specific request.
- **CommunityPost Safety**: Any community post can be read publicly, but only written by verified authenticated users with their correct user tag/ID.

## 2. The "Dirty Dozen" Hack Payloads (Identity & Privilege Violations)
Here are twelve payloads designed to bypass and infect our models and how the rules block them:

1. **Self-Appointed Points Injection**: Attack payload writing `/users/hacker` with `{"points": 99999}`.
   - *Security Rule block*: The `allow update` block uses `affectedKeys().hasOnly(['name', 'phone', 'email', 'bloodGroup', 'isAvailable', 'avatar', 'weight', 'age', 'medications', 'healthIssues'])`, which explicitly excludes `points` and `role`.
2. **Identity Spoofing Profile Creation**: Unsigned profile write to `/users/anyOtherUid`.
   - *Security Rule block*: Verified via `request.auth.uid == userId`.
3. **Malicious ID Poisoning (Junk Character Attacks)**: Trying to write to `/users/admin%20inject`.
   - *Security Rule block*: Blocked via `isValidId(userId)` regex validation.
4. **Denial of Wallet (Huge String Attack)**: Sending a name that is 10MB in size.
   - *Security Rule block*: The string validation checks `incoming().name.size() < 128`.
5. **Unauthorized Blood Request Overwriting**: Modifying someone else's active blood request status to "Arrived".
   - *Security Rule block*: Blocked since updates are bounded by specific roles (e.g. either the patient who created it or the matched donor).
6. **Self-Assigning as Admin**: Writing `/users/hacker` with `{"role": "admin"}` during updates or creation.
   - *Security Rule block*: `affectedKeys()` excludes `role` and restricts it during updates.
7. **Phantom Blood Request Creation**: Creating a `BloodRequest` where `patientName` is the name of another user.
   - *Security Rule block*: Checked via validation helpers.
8. **Message Hijacking (Sub-collection Spying)**: A user trying to listen or write message payloads on a blood request they are not involved in.
   - *Security Rule block*: Verified by fetching the parent `BloodRequest` and checking `request.auth.uid` matches the `donorId` or host user's UID.
9. **Negative Units Needed**: Creating a request with `{"unitsNeeded": -10}`.
   - *Security Rule block*: Checked via `incoming().unitsNeeded is int && incoming().unitsNeeded > 0`.
10. **Client-side Timestamp Hijacking**: Client providing custom expired date in the future for `createdAt`.
    - *Security Rule block*: Enforced via `incoming().createdAt == request.time`.
11. **Shadow Update "Ghost Field" Injection**: Sending a payload with `{"isVerified": true, "ghost_field": "val"}` during updates.
    - *Security Rule block*: Blocked with `affectedKeys().hasOnly(...)`.
12. **Community Post comment spamming**: Malicious user editing a Community Post author name or ID.
    - *Security Rule block*: Blocked since update of post only allows likes incrementing through specific atomic transaction checks.

## 3. Test Runner Definition (Verification Framework)
A verification framework is simulated to execute these queries against a local Firestore emulator before deployment to secure production.
