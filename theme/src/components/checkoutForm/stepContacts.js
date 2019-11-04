import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { themeSettings, text } from '../../lib/settings';
import { formatCurrency } from '../../lib/helper';
import InputField from './inputField';

const validateRequired = value =>
	value && value.length > 0 ? undefined : text.required;
const ReadOnlyField = ({ name, value }) => {
	return (
		<div className="checkout-field-preview">
			<div className="name">{name}</div>
			<div className="value">{value}</div>
		</div>
	);
};
const validateEmail = value =>
	value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
		? text.emailInvalid
		: undefined;
class CheckoutStepContacts extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		this.setState({
			[name]: value
		});
	}
	handleSubmit() {
		let data = {
			customerName: this.state.customerName,
			customerMobile: this.state.customerMobile,
			shippingAddress: {
				address: this.state.shippingAddress,
				phone: this.state.customerMobile,
				fullName: this.state.customerName
			}
			// shippingMethod:{}
		};
		this.props.onSubmit(data);
	}
	getField = fieldName => {
		const fields = this.props.checkoutFields || [];
		const field = fields.find(item => item.name === fieldName);
		return field;
	};

	getFieldStatus = fieldName => {
		const field = this.getField(fieldName);
		return field && field.status ? field.status : 'required';
	};

	isFieldOptional = fieldName => {
		return this.getFieldStatus(fieldName) === 'optional';
	};

	isFieldHidden = fieldName => {
		return this.getFieldStatus(fieldName) === 'hidden';
	};

	getFieldValidators = fieldName => {
		const isOptional = this.isFieldOptional(fieldName);
		let validatorsArray = [];
		if (!isOptional) {
			validatorsArray.push(validateRequired);
		}
		if (fieldName === 'email') {
			validatorsArray.push(validateEmail);
		}

		return validatorsArray;
	};

	getFieldPlaceholder = fieldName => {
		const field = this.getField(fieldName);
		return field && field.placeholder && field.placeholder.length > 0
			? field.placeholder
			: '';
	};

	getFieldLabelText = fieldName => {
		const field = this.getField(fieldName);
		if (field && field.label && field.label.length > 0) {
			return field.label;
		} else {
			switch (fieldName) {
				case 'fullName':
					return text.fullName;
					break;
				case 'mobile':
					return text.mobile;
					break;
				case 'address':
					return text.address;
					break;
				case 'company':
					return text.company;
					break;
				default:
					return 'Unnamed field';
			}
		}
	};

	getFieldLabel = fieldName => {
		const labelText = this.getFieldLabelText(fieldName);
		return this.isFieldOptional(fieldName)
			? `${labelText} (${text.optional})`
			: labelText;
	};

	render() {
		const {
			handleSubmit,
			pristine,
			invalid,
			valid,
			reset,
			submitting,
			loadingShippingMethods,
			loadingPaymentMethods,
			order,
			settings,
			saveShippingLocation,
			saveShippingMethod,
			savePaymentMethod,
			paymentMethods,
			shippingMethods,
			inputClassName,
			buttonClassName,
			editButtonClassName,
			onEdit,
			isReadOnly,
			title
		} = this.props;
		if (isReadOnly) {
			let paymentMethodName = paymentMethods.map(item => {
				if (item.id == order.paymentMethodId) {
					return item.name;
				}
			});
			let shippingMethodName = shippingMethods.map(item => {
				if (item.id == order.shippingMethodId) {
					return item.name;
				}
			});
			return (
				<div className="checkout-step">
					<h1>
						<span>1</span>
						{title}
					</h1>

					{!this.isFieldHidden('name') && (
						<ReadOnlyField name={text.fullName} value={order.customerName} />
					)}
					{!this.isFieldHidden('mobile') && (
						<ReadOnlyField name={text.mobile} value={order.customerMobile} />
					)}
					{!this.isFieldHidden('address') && (
						<ReadOnlyField
							name={text.address}
							value={order.shippingAddress.address}
						/>
					)}

					<ReadOnlyField
						name={text.shippingMethod}
						value={shippingMethodName}
					/>
					<ReadOnlyField name={text.paymentMethod} value={paymentMethodName} />

					<div className="checkout-button-wrap">
						<button
							type="button"
							onClick={onEdit}
							className={editButtonClassName}
						>
							{text.edit}
						</button>
					</div>
				</div>
			);
		} else {
			return (
				<div className="checkout-step">
					<h1>{title}</h1>

					<Field
						className={inputClassName}
						name="customerName"
						component={InputField}
						onChange={this.handleChange}
						type="text"
						label={this.getFieldLabel('fullName')}
						validate={this.getFieldValidators('name')}
						placeholder={this.getFieldPlaceholder('name')}
					/>

					<Field
						className={inputClassName}
						name="customerMobile"
						component={InputField}
						onChange={this.handleChange}
						type="tel"
						label={this.getFieldLabel('mobile')}
						validate={this.getFieldValidators('mobile')}
						placeholder={this.getFieldPlaceholder('mobile')}
					/>

					<h2>{text.shippingTo}</h2>

					<Field
						className={inputClassName}
						name="shippingAddress"
						component={InputField}
						onChange={this.handleChange}
						type="text"
						onChange={this.handleChange}
						label={this.getFieldLabel('address')}
						validate={this.getFieldValidators('country')}
						placeholder={this.getFieldPlaceholder('country')}
					/>
					<Field
						className={inputClassName}
						name="shippingCompany"
						component={InputField}
						onChange={this.handleChange}
						type="text"
						onChange={this.handleChange}
						label={this.getFieldLabel('company')}
						validate={this.getFieldValidators('country')}
						placeholder={this.getFieldPlaceholder('country')}
					/>
					<h2>
						{text.shippingMethods}{' '}
						{loadingShippingMethods && <small>{text.loading}</small>}
					</h2>
					<div className="shipping-methods">
						{shippingMethods.map((method, index) => (
							<label key={index} className={'shipping-method active'}>
								<Field
									name="shipping_method_id"
									component="input"
									type="radio"
									value={method.id || ''}
									onClick={() => saveShippingMethod(method.id)}
								/>
								<div>
									<div className="shipping-method-name">{method.name}</div>
									<div className="shipping-method-description">
										{method.description}
									</div>
								</div>
								<span className="shipping-method-rate">
									{formatCurrency(method.price, settings)}
								</span>
							</label>
						))}
					</div>

					<h2>
						{text.paymentMethods}{' '}
						{loadingPaymentMethods && <small>{text.loading}</small>}
					</h2>
					<div className="payment-methods">
						{paymentMethods.map((method, index) => (
							<label key={index} className={'payment-method active'}>
								<Field
									name="payment_method_id"
									validate={[validateRequired]}
									component="input"
									type="radio"
									value={method.id || ''}
									onClick={() => savePaymentMethod(method.id)}
								/>
								<div>
									<div className="payment-method-name">{method.name}</div>
									<div className="payment-method-description">
										{method.description}
									</div>
								</div>
								<span className="payment-method-logo" />
							</label>
						))}
					</div>

					<div className="checkout-button-wrap">
						<button
							onClick={this.handleSubmit}
							disabled={invalid}
							className={buttonClassName}
						>
							{text.next}
						</button>
					</div>
				</div>
			);
		}
	}
}

export default reduxForm({
	form: 'CheckoutStepContacts',
	enableReinitialize: true,
	keepDirtyOnReinitialize: true
})(CheckoutStepContacts);
