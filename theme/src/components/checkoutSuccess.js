import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { text } from '../lib/settings';
import * as helper from '../lib/helper';

const getCheckoutField = (checkoutFields, fieldName) => {
	if (checkoutFields && checkoutFields.length > 0) {
		return checkoutFields.find(
			f => f.name === fieldName && f.status !== 'hidden'
		);
	}
	return null;
};
const FullnameField = ({ order, checkoutFields }) => {
	return <ShippingFieldDiv label={text.phone} value={order.customerName} />;
};
const MobileField = ({ order, checkoutFields }) => {
	return <ShippingFieldDiv label={text.phone} value={order.customerMobile} />;
};

const AddressField = ({ order, checkoutFields }) => {
	return (
		<ShippingFieldDiv
			label={text.address}
			value={order.shippingAddress.address}
		/>
	);
};

const CommentsField = ({ order, checkoutFields }) => {
	return (
		<ShippingFieldDiv
			label={text.comments}
			value={order.customerComment || ''}
		/>
	);
};

const ShippingFields = ({ order, shippingMethods }) => {
	let shippingMethod;
	shippingMethods.map(item => {
		if (item.id == order.shippingMethodId) {
			shippingMethod = item.name;
		}
	});
	return (
		<ShippingFieldDiv
			key={order.id}
			label={text.shippingMethods}
			value={shippingMethod}
		/>
	);
};

const ShippingFieldDiv = ({ label, value }) => (
	<div className="shipping-field">
		<label>{label}: </label>
		{value}
	</div>
);

const OrderItem = ({ item, settings }) => (
	<div className="columns is-mobile is-gapless checkout-success-row">
		<div className="column is-6">
			{item.itemName}
			<br />
			{/* <span>{item.variant_name}</span> */}
		</div>
		<div className="column is-2 has-text-right">
			{helper.formatCurrency(item.itemPrice, settings)}
		</div>
		<div className="column is-2 has-text-centered">{item.quantity}</div>
		<div className="column is-2 has-text-right">
			{helper.formatCurrency(item.itemPrice * item.quantity, settings)}
		</div>
	</div>
);

const OrderItems = ({ items, settings }) => {
	if (items) {
		const rows = items.map(item => (
			<OrderItem key={item.id} item={item} settings={settings} />
		));
		return <div>{rows}</div>;
	}
	return null;
};

const CheckoutSuccess = ({
	order,
	settings,
	pageDetails,
	shippingMethods,
	paymentMethods,
	checkoutFields
}) => {
	let shippingMethod;
	shippingMethods.map(item => {
		if (item.id == order.shippingMethodId) {
			shippingMethod = item.name;
		}
	});
	let paymentMethod;
	paymentMethods.map(item => {
		if (item.id == order.paymentMethodId) {
			paymentMethod = item.name;
		}
	});

	if (order && order.item && order.item.length > 0) {
		let totalPrice = 0;

		order.item.map(value => {
			totalPrice = totalPrice + value.itemPrice * value.quantity;
		});
		return (
			<div className="checkout-success-details">
				<h1 className="checkout-success-title">
					<img src="/assets/images/success.svg" alt="" />
					<br />
					{text.checkoutSuccessTitle}
				</h1>

				<div
					dangerouslySetInnerHTML={{
						__html: pageDetails.content
					}}
				/>

				<hr />

				<div className="columns" style={{ marginBottom: '3rem' }}>
					<div className="column is-6">
						<b>{text.shipping}</b>
						<FullnameField order={order} checkoutFields={checkoutFields} />
						<MobileField order={order} checkoutFields={checkoutFields} />
						<AddressField order={order} checkoutFields={checkoutFields} />
						<ShippingFields order={order} shippingMethods={shippingMethods} />
						<CommentsField order={order} checkoutFields={checkoutFields} />
					</div>

					<div className="column is-6">
						<b>{text.orderNumber}</b>: {order.orderCode}
						<br />
						<b>{text.shippingMethod}</b>: {shippingMethod}
						<br />
						<b>{text.paymentMethod}</b>: {paymentMethod}
						<br />
					</div>
				</div>

				<div className="columns is-mobile is-gapless checkout-success-row">
					<div className="column is-6">
						<b>{text.productName}</b>
					</div>
					<div className="column is-2 has-text-right">
						<b>{text.price}</b>
					</div>
					<div className="column is-2 has-text-centered">
						<b>{text.qty}</b>
					</div>
					<div className="column is-2 has-text-right">
						<b>{text.total}</b>
					</div>
				</div>

				<OrderItems items={order.item} settings={settings} />

				<div className="columns">
					<div className="column is-offset-7 checkout-success-totals">
						{/* <div>
							<span>{text.subtotal}:</span>
							<span>{helper.formatCurrency(order.subtotal, settings)}</span>
						</div> */}
						{/* <div>
							<span>{text.shipping}:</span>
							<span>
								{helper.formatCurrency(order.shipping_total, settings)}
							</span>
						</div> */}
						<div>
							<b>{text.grandTotal}:</b>
							<b>{helper.formatCurrency(totalPrice, settings)}</b>
						</div>
					</div>
				</div>
			</div>
		);
	}
	return <div className="has-text-centered">{text.cartEmpty}</div>;
};

CheckoutSuccess.propTypes = {
	order: PropTypes.shape({}),
	settings: PropTypes.shape({}).isRequired,
	pageDetails: PropTypes.shape({}).isRequired,
	shippingMethod: PropTypes.shape({}).isRequired,
	checkoutFields: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

CheckoutSuccess.defaultProps = {
	order: null
};

export default CheckoutSuccess;
