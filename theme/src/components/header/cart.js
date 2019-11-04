import React from 'react';
import { NavLink } from 'react-router-dom';
import { themeSettings, text } from '../../lib/settings';
import * as helper from '../../lib/helper';

const CartItem = ({ item, deleteCartItem, settings }) => {
	return (
		<div className="columns is-mobile">
			<div className="column is-2">
				<div className="image">
					<NavLink to={item.path}>
						<img src={item.images[0].filename} />
					</NavLink>
				</div>
			</div>
			<div className="column">
				<div>
					<NavLink to={item.path}>{item.name}</NavLink>
				</div>
				{item.variant_name && (
					<div className="cart-option-name">{item.variant_name}</div>
				)}
				<div className="cart-quantity">
					{text.qty}: {item.quantity}
				</div>
			</div>
			<div className="column is-4 has-text-right">
				<div className="mini-cart-item-price">
					{helper.formatCurrency(item.price_total, settings)}
				</div>
				<a
					className="button is-light is-small"
					onClick={() => deleteCartItem(item.id)}
				>
					{text.remove}
				</a>
			</div>
		</div>
	);
};

export default class Cart extends React.PureComponent {
	render() {
		const { cart, deleteCartItem, settings, cartToggle } = this.props;

		if (cart && cart.length > 0) {
			const items = cart.map(item => (
				<CartItem
					key={item.id}
					item={item}
					deleteCartItem={deleteCartItem}
					settings={settings}
				/>
			));
			let subtotal = 0;
			cart.map(item => {
				subtotal = subtotal + item.price_total;
			});
			return (
				<div className="mini-cart">
					{items}
					<hr className="separator" />
					<div className="columns is-mobile is-gapless">
						<div className="column is-7">
							<b>{text.subtotal}</b>
						</div>
						<div className="column is-5 has-text-right">
							<b>{helper.formatCurrency(subtotal, settings)}</b>
						</div>
					</div>
					<NavLink
						className="button is-primary is-fullwidth has-text-centered"
						style={{ textTransform: 'uppercase' }}
						to="/checkout"
						onClick={cartToggle}
					>
						{text.proceedToCheckout}
					</NavLink>
				</div>
			);
		}
		return (
			<div className="mini-cart">
				<p>{text.cartEmpty}</p>
			</div>
		);
	}
}
