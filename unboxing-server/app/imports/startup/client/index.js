import { Accounts } from 'meteor/accounts-base';

import '../both/accounts';

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
});