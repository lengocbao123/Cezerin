import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { themeSettings, text } from '../../lib/settings';
import InputField from './inputField';
import TextareaField from './textareaField';

const validateRequired = value =>
	value && value.length > 0 ? undefined : text.required;

const getFieldLabelByKey = key => {
	switch (key) {
		case 'full_name':
			return text.fullName;
		case 'address1':
			return text.address1;
		case 'address2':
			return text.address2;
		case 'postal_code':
			return text.postal_code;
		case 'phone':
			return text.phone;
		case 'company':
			return text.company;
		default:
			return '';
	}
};

const getFieldLabel = field => {
	const label =
		field.label && field.label.length > 0
			? field.label
			: getFieldLabelByKey(field.key);
	return field.required === true ? label : `${label} (${text.optional})`;
};

class CheckoutStepShipping extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			billingAsShipping: true
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	onChangeBillingAsShipping = event => {
		this.setState({
			billingAsShipping: event.target.checked
		});
	};
	handleChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		this.setState({
			[name]: value
		});
	}
	async handleSubmit() {
		let billingAddress = {};
		if (this.state.billingAsShipping == true) {
			billingAddress = this.props.order.shippingAddress;
		} else {
			billingAddress = {
				address: this.state.address,
				phone: this.state.phone,
				fullName: this.state.fullname,
				company: this.state.company
			};
		}
		await this.props.onSubmit({
			billingAddress: billingAddress,
			customerComment: this.state.comments
		});

		await this.props.checkout(this.props.order);
	}
	render() {
		const {
			handleSubmit,
			pristine,
			invalid,
			valid,
			reset,
			submitting,
			processingCheckout,
			initialValues,
			shippingMethod,
			checkoutFields,
			settings,
			inputClassName,
			buttonClassName,
			editButtonClassName,
			title,
			show,
			isReadOnly,
			showPaymentForm,
			onEdit
		} = this.props;

		const hideBillingAddress = settings.hide_billing_address === true;
		const commentsField = checkoutFields.find(f => f.name === 'comments');
		const commentsFieldPlaceholder =
			commentsField &&
			commentsField.placeholder &&
			commentsField.placeholder.length > 0
				? commentsField.placeholder
				: '';
		const commentsFieldLabel =
			commentsField && commentsField.label && commentsField.label.length > 0
				? commentsField.label
				: text.comments;
		const commentsFieldStatus =
			commentsField && commentsField.status.length > 0
				? commentsField.status
				: null;
		const commentsValidate =
			commentsFieldStatus === 'required' ? validateRequired : null;
		const hideCommentsField = commentsFieldStatus === 'hidden';

		if (!show) {
			return (
				<div className="checkout-step">
					<h1>
						<span>2</span>
						{title}
					</h1>
				</div>
			);
		} else {
			return (
				<div className="checkout-step">
					<h1>
						<span>2</span>
						{title}
					</h1>

					{!hideCommentsField && (
						<Field
							className={inputClassName + ' shipping-comments'}
							name="comments"
							onChange={this.handleChange}
							component={TextareaField}
							type="text"
							label={commentsFieldLabel}
							placeholder={commentsFieldPlaceholder}
							validate={commentsValidate}
							rows="3"
						/>
					)}

					{!hideBillingAddress && (
						<div>
							<h2>{text.billingAddress}</h2>
							<div className="billing-as-shipping">
								<input
									id="billingAsShipping"
									type="checkbox"
									onChange={this.onChangeBillingAsShipping}
									checked={this.state.billingAsShipping}
								/>
								<label htmlFor="billingAsShipping">{text.sameAsShipping}</label>
							</div>

							{!this.state.billingAsShipping && (
								<div>
									<Field
										className={inputClassName + ' billing-fullname'}
										name="fullname"
										onChange={this.handleChange}
										component={InputField}
										type="text"
										label={text.fullName}
										validate={[validateRequired]}
									/>

									<Field
										className={inputClassName + ' billing-address1'}
										name="address"
										onChange={this.handleChange}
										component={InputField}
										type="text"
										label={text.address + ` (${text.optional})`}
									/>

									<Field
										className={inputClassName + ' billing-phone'}
										name="phone"
										onChange={this.handleChange}
										id="billing_address.phone"
										component={InputField}
										type="text"
										label={text.phone + ` (${text.optional})`}
									/>
									<Field
										className={inputClassName + ' billing-company'}
										name="company"
										onChange={this.handleChange}
										component={InputField}
										type="text"
										label={text.company + ` (${text.optional})`}
									/>
								</div>
							)}
						</div>
					)}

					<div className="checkout-button-wrap">
						<button
							onClick={this.handleSubmit}
							disabled={submitting || processingCheckout || invalid}
							className={`${buttonClassName}${
								processingCheckout ? ' is-loading' : ''
							}`}
						>
							{showPaymentForm ? text.next : text.orderSubmit}
						</button>
					</div>
				</div>
			);
		}
	}
}

export default reduxForm({
	form: 'CheckoutStepShipping',
	enableReinitialize: true,
	keepDirtyOnReinitialize: false
})(CheckoutStepShipping);
