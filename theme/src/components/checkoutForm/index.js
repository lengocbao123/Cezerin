import React from 'react';
import { themeSettings, text } from '../../lib/settings';
import CheckoutStepContacts from './stepContacts';
import CheckoutStepShipping from './stepShipping';
import CheckoutStepPayment from './stepPayment';

export default class CheckoutForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			step: 1,
			order: {}
		};
	}

	componentDidMount() {
		this.props.loadShippingMethods();
		this.props.loadPaymentMethods();
		let updateOrder = Object.assign({}, this.state.order, {
			item: this.props.state.cartItems
		});
		this.setState({ order: updateOrder });
	}

	changeStep = step => {
		this.setState({ step: step });
	};

	handleContactsSave = () => {
		this.changeStep(2);
	};

	handleContactsEdit = () => {
		this.changeStep(1);
	};

	handleShippingSave = () => {
		this.changeStep(3);
	};

	handleShippingEdit = () => {
		this.changeStep(2);
	};

	handleContactsSubmit = values => {
		let updateOrder = Object.assign({}, this.state.order, values);
		this.setState({ order: updateOrder, step: 2 });
	};

	handleLocationSave = shippingLocation => {
		this.props.updateCart(
			{
				shipping_address: shippingLocation,
				billing_address: shippingLocation,
				payment_method_id: null,
				shipping_method_id: null
			},
			cart => {
				this.props.loadShippingMethods();
				this.props.loadPaymentMethods();
			}
		);
	};

	handleShippingMethodSave = shippingMethodId => {
		let shippingMethod;
		this.props.state.shippingMethods.map(item => {
			if (item.id == shippingMethodId) {
				shippingMethod = item;
			}
		});
		let updateOrder = Object.assign({}, this.state.order, {
			shippingMethodId: shippingMethodId,
			shippingMethod: shippingMethod
		});
		this.setState({ order: updateOrder });
	};

	handlePaymentMethodSave = paymentMethodId => {
		let paymentMethod;
		this.props.state.paymentMethods.map(item => {
			if (item.id == paymentMethodId) {
				paymentMethod = item;
			}
		});
		let updateOrder = Object.assign({}, this.state.order, {
			paymentMethodId: paymentMethodId,
			paymentMethod: paymentMethod
		});
		this.setState({ order: updateOrder });
	};

	isShowPaymentForm = () => {
		// const { payment_method_gateway } = this.props.state.cart;
		const paymentGatewayExists = true;
		// payment_method_gateway && payment_method_gateway !== '';
		return paymentGatewayExists;
	};

	handleShippingSubmit = values => {
		console.log(values);
		let updateOrder = Object.assign({}, this.state.order, values);
		this.setState({ order: updateOrder });
		// if (this.isShowPaymentForm()) {
		// 	const { shipping_address, billing_address, comments } = values;

		// 	this.props.updateCart({
		// 		shipping_address,
		// 		billing_address,
		// 		comments
		// 	});
		// 	this.handleShippingSave();
		// } else {
		// 	this.props.checkout(values);
		// }
	};

	handleSuccessPayment = () => {
		this.props.checkout(null);
	};

	handleCheckoutWithToken = tokenId => {
		this.props.updateCart(
			{
				payment_token: tokenId
			},
			cart => {
				this.props.checkout(null);
			}
		);
	};

	render() {
		const { step, shippingMethod, paymentMethod } = this.state;

		const {
			settings,
			cartItems,
			cart,
			paymentMethods,
			shippingMethods,
			loadingShippingMethods,
			loadingPaymentMethods,
			checkoutFields,
			processingCheckout
		} = this.props.state;

		const {
			checkoutInputClass = 'checkout-field',
			checkoutButtonClass = 'checkout-button',
			checkoutEditButtonClass = 'checkout-button-edit'
		} = themeSettings;

		return (
			<div className="checkout-form">
				<CheckoutStepContacts
					isReadOnly={step > 1}
					title={text.customerDetails}
					inputClassName={checkoutInputClass}
					buttonClassName={checkoutButtonClass}
					editButtonClassName={checkoutEditButtonClass}
					paymentMethods={paymentMethods}
					shippingMethods={shippingMethods}
					settings={settings}
					saveShippingLocation={this.handleLocationSave}
					saveShippingMethod={this.handleShippingMethodSave}
					savePaymentMethod={this.handlePaymentMethodSave}
					onSubmit={this.handleContactsSubmit}
					onEdit={this.handleContactsEdit}
					order={this.state.order}
				/>

				<CheckoutStepShipping
					show={step >= 2}
					isReadOnly={step > 2}
					title={text.shipping}
					inputClassName={checkoutInputClass}
					buttonClassName={checkoutButtonClass}
					editButtonClassName={checkoutEditButtonClass}
					initialValues={cart}
					settings={settings}
					processingCheckout={processingCheckout}
					shippingMethod={shippingMethod}
					checkoutFields={checkoutFields}
					showPaymentForm={false}
					onSave={this.handleShippingSave}
					onEdit={this.handleShippingEdit}
					onSubmit={this.handleShippingSubmit}
					order={this.state.order}
					checkout={this.props.checkout}
				/>

				{/* {showPaymentForm && (
						<CheckoutStepPayment
							show={step === 3}
							title={text.payment}
							inputClassName={checkoutInputClass}
							buttonClassName={checkoutButtonClass}
							cart={cart}
							settings={settings}
							processingCheckout={processingCheckout}
							handleSuccessPayment={this.handleSuccessPayment}
							onCreateToken={this.handleCheckoutWithToken}
						/>
					)} */}
			</div>
		);
	}
}
