import * as t from './actionTypes';
import messages from 'lib/text';
import axios from 'axios';
import { baseUrl } from '../../../../../config/admin';
function requestCategories() {
	return {
		type: t.CATEGORIES_REQUEST
	};
}

function receiveCategories(items) {
	return {
		type: t.CATEGORIES_RECEIVE,
		items
	};
}

function receiveErrorCategories(error) {
	return {
		type: t.CATEGORIES_FAILURE,
		error
	};
}

export function selectCategory(id) {
	return {
		type: t.CATEGORIES_SELECT,
		selectedId: id
	};
}

export function deselectCategory() {
	return {
		type: t.CATEGORIES_DESELECT
	};
}

function requestUpdateCategory(id) {
	return {
		type: t.CATEGORY_UPDATE_REQUEST
	};
}

function receiveUpdateCategory() {
	return {
		type: t.CATEGORY_UPDATE_SUCCESS
	};
}

function errorUpdateCategory(error) {
	return {
		type: t.CATEGORY_UPDATE_FAILURE,
		error
	};
}

function successCreateCategory(id) {
	return {
		type: t.CATEGORY_CREATE_SUCCESS
	};
}

function successDeleteCategory(id) {
	return {
		type: t.CATEGORY_DELETE_SUCCESS
	};
}

function successMoveUpDownCategory(newPosition) {
	return {
		type: t.CATEGORY_MOVE_UPDOWN_SUCCESS,
		position: newPosition
	};
}

function successReplaceCategory(newParentId) {
	return {
		type: t.CATEGORY_REPLACE_SUCCESS
	};
}

function imageUploadStart() {
	return {
		type: t.CATEGORY_IMAGE_UPLOAD_START
	};
}

function imageUploadEnd() {
	return {
		type: t.CATEGORY_IMAGE_UPLOAD_END
	};
}

export function fetchCategories() {
	return dispatch => {
		dispatch(requestCategories());
		axios
			.get(`${baseUrl}/product_categories`)
			.then(response => {
				response.data.forEach((element, index, theArray) => {
					if (theArray[index].name === '') {
						theArray[index].name = `<${messages.draft}>`;
					}
				});
				dispatch(receiveCategories(response.data));
			})
			.catch(error => {
				dispatch(receiveErrorCategories(error));
			});
	};
}

function shouldFetchCategories(state) {
	const categories = state.productCategories;
	if (categories.isFetched || categories.isFetching) {
		return false;
	} else {
		return true;
	}
}
export function fetchCategoriesIfNeeded() {
	return (dispatch, getState) => {
		if (shouldFetchCategories(getState())) {
			return dispatch(fetchCategories());
		}
	};
}

function sendUpdateCategory(id, data) {
	return dispatch => {
		dispatch(requestUpdateCategory(id));
		axios({
			method: 'POST',
			url: `${baseUrl}/product_categories/update/${id}`,
			data: data
		})
			.then(response => {
				dispatch(receiveUpdateCategory());
				dispatch(fetchCategories());
			})
			.catch(error => {
				dispatch(errorUpdateCategory(error));
			});
	};
}

export function updateCategory(data) {
	return (dispatch, getState) => {
		return dispatch(sendUpdateCategory(data.id, data));
	};
}

export function createCategory() {
	return (dispatch, getState) => {
		axios({
			method: 'POST',
			url: `${baseUrl}/product_categories`,
			data: { enabled: false }
		})
			.then(response => {
				dispatch(successCreateCategory(response.data.id));
				dispatch(fetchCategories());
				dispatch(selectCategory(response.data.id));
			})
			.catch(error => {
				console.log(error);
			});
	};
}

export function deleteImage() {
	return (dispatch, getState) => {
		const state = getState();
		const categoryId = state.productCategories.selectedId;
		axios({
			method: 'DELETE',
			url: `${baseUrl}/product_categories/${categoryId}/image`
		})
			.then(() => {
				dispatch(fetchCategories());
			})
			.catch(error => {
				//dispatch error
				console.log(error);
			});
	};
}

export function deleteCategory(id) {
	return (dispatch, getState) => {
		axios({
			method: 'DELETE',
			url: `${baseUrl}/product_categories/${id}`
		})
			.then(response => {
				dispatch(successDeleteCategory(id));
				dispatch(deselectCategory());
				dispatch(fetchCategories());
			})
			.catch(error => {
				//dispatch error
				console.log(error);
			});
	};
}

function moveCategory(allCategories = [], selectedCategory, isUp = true) {
	return new Promise((resolve, reject) => {
		if (isUp) {
			allCategories = allCategories
				.filter(
					e =>
						e.parent_id === selectedCategory.parent_id &&
						e.id !== selectedCategory.id &&
						e.position < selectedCategory.position
				)
				.sort((a, b) => b.position - a.position);
		} else {
			allCategories = allCategories
				.filter(
					e =>
						e.parent_id === selectedCategory.parent_id &&
						e.id !== selectedCategory.id &&
						e.position > selectedCategory.position
				)
				.sort((a, b) => a.position - b.position);
		}

		if (allCategories.length > 0) {
			let targetCategory = allCategories[0];
			let newPosition = targetCategory.position;
			axios({
				method: 'POST',
				url: `${baseUrl}/product_categories/update/${selectedCategory.id}`,
				data: { position: targetCategory.position }
			})
				.then(() => {
					axios({
						method: 'POST',
						url: `${baseUrl}/product_categories/update/${targetCategory.id}`,
						data: { position: targetCategory.position }
					})
						.then(() => {
							resolve(newPosition);
						})
						.catch(err => {
							reject(err);
						});
				})
				.catch(err => {
					reject(err);
				});
		}
	});
}

export function moveUpCategory() {
	return (dispatch, getState) => {
		let state = getState();
		var allCategories = state.productCategories.items;
		var selectedCategory = allCategories.find(
			item => item.id === state.productCategories.selectedId
		);
		var isUp = true;
		return moveCategory(allCategories, selectedCategory, isUp).then(
			newPosition => {
				dispatch(successMoveUpDownCategory(newPosition));
				dispatch(fetchCategories());
			}
		);
	};
}

export function moveDownCategory() {
	return (dispatch, getState) => {
		let state = getState();
		var allCategories = state.productCategories.items;
		var selectedCategory = allCategories.find(
			item => item.id === state.productCategories.selectedId
		);
		var isUp = false;
		return moveCategory(allCategories, selectedCategory, isUp).then(
			newPosition => {
				dispatch(successMoveUpDownCategory(newPosition));
				dispatch(fetchCategories());
			}
		);
	};
}

export function replaceCategory(parentId) {
	return (dispatch, getState) => {
		let state = getState();
		var selectedCategory = state.productCategories.items.find(
			item => item.id === state.productCategories.selectedId
		);
		axios({
			method: 'POST',
			url: `${baseUrl}/product_categories/update/${selectedCategory.id}`,
			data: { parent_id: parentId }
		})
			.then(() => {
				dispatch(successReplaceCategory());
				dispatch(fetchCategories());
			})
			.catch(error => {
				//dispatch error
				console.log(error);
			});
	};
}

export function uploadImage(form) {
	form.append('type', 'categories');
	return (dispatch, getState) => {
		const state = getState();
		const categoryId = state.productCategories.selectedId;
		dispatch(imageUploadStart());
		axios({
			method: 'POST',
			url: `${baseUrl}/product_categories/${categoryId}/image`,
			data: form
		})
			.then(() => {
				dispatch(imageUploadEnd());
				dispatch(fetchCategories());
			})
			.catch(error => {
				dispatch(imageUploadEnd());
			});
	};
}
