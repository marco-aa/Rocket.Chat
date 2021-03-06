import { Meteor } from 'meteor/meteor';

import { settings } from '../../../settings';
import { WebdavAccounts } from '../../../models';
import { WebdavClientAdapter } from '../lib/webdavClientAdapter';

Meteor.methods({
	async getWebdavFileList(accountId, path) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid User', { method: 'getWebdavFileList' });
		}

		if (!settings.get('Webdav_Integration_Enabled')) {
			throw new Meteor.Error('error-not-allowed', 'WebDAV Integration Not Allowed', { method: 'getWebdavFileList' });
		}

		const account = WebdavAccounts.findOne({ _id: accountId, user_id: Meteor.userId() });
		if (!account) {
			throw new Meteor.Error('error-invalid-account', 'Invalid WebDAV Account', { method: 'getWebdavFileList' });
		}

		const client = new WebdavClientAdapter(
			account.server_url,
			account.username,
			account.password,
		);
		try {
			const data = await client.getDirectoryContents(path);
			return { success: true, data };
		} catch (error) {
			return { success: false, message: 'could-not-access-webdav', error };
		}
	},
});
