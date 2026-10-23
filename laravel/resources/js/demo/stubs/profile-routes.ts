// Stands in for '@/routes/profile' and '@/actions/App/Http/Controllers/Settings/ProfileController'.
import { profileDestroy, profileEdit, profileUpdate } from './wayfinder';

export const edit = profileEdit;
export const update = profileUpdate;
export const destroy = profileDestroy;

export default { edit, update, destroy };
