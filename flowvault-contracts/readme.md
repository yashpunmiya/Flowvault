test: add security vulnerability protection tests

- Test prevention of split-to-self
- Test lock amount vs hold amount validation
- Test prevention of lock block reductionon subsequent deposits
- Test lock block extension on subsequent deposits
- Test expired lock clearing on new deposits
security: fix critical vulnerabilities in vault contract

- Fix lock block overwrite: prevent reducing lock time on subsequent deposits
- Add lock amount validation: ensure lock doesn't exceed hold amount
- Clear expired locks: properly handle expired locks on new deposits
- Prevent split-to-self: users cannot split funds to themselves
- Add overflow checks: protect against arithmetic overflow
- Add new error constants: ERR-ARITHMETIC-OVERFLOW, ERR-LOCK-EXCEEDS-HOLD, ERR-SPLIT-TO-SELF
