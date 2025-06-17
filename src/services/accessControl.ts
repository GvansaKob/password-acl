import { AccessControl } from 'accesscontrol';

const ac = new AccessControl();

ac.grant('admin')
  .createAny('profile')
  .readAny('profile')
  .updateAny('profile')
  .deleteAny('profile')
  .createAny('data')
  .readAny('data')
  .updateAny('data')
  .deleteAny('data');

ac.grant('user')
  .createOwn('profile')
  .readOwn('profile')
  .updateOwn('profile')
  .deleteOwn('profile')
  .createOwn('data')
  .readOwn('data')
  .updateOwn('data')
  .deleteOwn('data');

ac.grant('guest')
  .readAny('profile');

export { ac };
