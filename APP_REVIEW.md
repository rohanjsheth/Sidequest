# App Review Access

Enable the API reviewer login before submitting a build for external TestFlight
or App Review.

## API environment

Required:

```sh
APPLE_REVIEW_LOGIN_ENABLED=true
```

Optional overrides:

```sh
APPLE_REVIEW_PHONE=+14155550100
APPLE_REVIEW_CODE=000000
```

When enabled, `/auth/start` skips Twilio for the review phone and
`/auth/verify` accepts the review code. All other phone numbers still use
Twilio Verify.

## Review Notes

```text
Use phone +1 (415) 555-0100 and verification code 000000 to access a seeded
review account. SMS is bypassed for this account only. The account has demo
friends and upcoming plans so the feed, plan detail, sharing, RSVP, friends,
activity, profile edit, sign out, and account deletion flows can be tested.
```
