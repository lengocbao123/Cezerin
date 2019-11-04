import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { themeSettings, text } from '../lib/settings';
import * as helper from '../lib/helper';

const SummaryItem = ({ settings, item, updateCartItemQuantiry }) => {
	return (
		<div className="columns is-mobile">
			<div className="column is-3">
				<div className="image">
					<NavLink to={item.path}>
						<img
							className="product-image"
							src={item.images[0].filename}
							alt={item.name}
							title={item.name}
						/>
					</NavLink>
				</div>
			</div>
			<div className="column">
				<div>
					<NavLink to={item.path}>{item.name}</NavLink>
				</div>
				{!item.variant_name ? (
					''
				) : (
					<div className="cart-option-name">{item.variant_name}</div>
				)}
				<div className="qty">
					<span>
						{text.qty}: {item.quantity}
					</span>
				</div>
			</div>
			<div className="column is-3 has-text-right price">
				{helper.formatCurrency(item.price_total, settings)}
			</div>
		</div>
	);
};

SummaryItem.propTypes = {
	settings: PropTypes.shape({}).isRequired,
	item: PropTypes.shape({}).isRequired,
	updateCartItemQuantiry: PropTypes.func.isRequired
};

const OrderSummary = props => {
	const {
		updateCartItemQuantiry,
		state: { cart, settings, cartItems }
	} = props;
	let grand_total = 0;
	if (props.state.cartItems) {
		const items = cartItems.map(item => {
			grand_total = grand_total + item.price_total;
			return (
				<SummaryItem
					key={item.id}
					item={item}
					updateCartItemQuantiry={updateCartItemQuantiry}
					settings={settings}
				/>
			);
		});

		return (
			<div
				className="checkout-box content is-small"
				style={{ paddingBottom: 0 }}
			>
				<div className="title is-4">{text.orderSummary}</div>
				<hr className="separator" />
				{items}
				<div className="columns is-mobile is-gapless is-multiline summary-block">
					<div className="column is-6 total-text">{text.grandTotal}</div>
					<div className="column is-6 total-price">
						{helper.formatCurrency(grand_total, settings)}
					</div>
				</div>
			</div>
		);
	}
	return null;
};

OrderSummary.propTypes = {
	updateCartItemQuantiry: PropTypes.func.isRequired,
	state: PropTypes.shape({
		cart: PropTypes.shape({}),
		settings: PropTypes.shape({}).isRequired
	}).isRequired
};

export default OrderSummary;
