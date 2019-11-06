import React from 'react';
import { Link } from 'react-router-dom';

import messages from 'lib/text';
import * as helper from 'lib/helper';
import style from './style.css';
import ShippingAddressForm from './shippingAddressForm.js';

import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

const getShippingFieldLabel = ({ label, key }) => {
	return label && label.length > 0
		? label
		: helper.getOrderFieldLabelByKey(key);
};

const ShippingFields = ({ order, shippingMethod }) => {
	return (
		<ShippingFieldDiv label={messages.shippingMethod} value={shippingMethod} />
	);
};

const ShippingFieldDiv = ({ label, value }) => (
	<div>
		<label>{label}: </label>
		{value}
	</div>
);

const ShippingAddress = ({ order, settings }) => {
	const address = order.shippingAddress;
	const shippingMethod = order.shippingMethod;

	return (
		<div className={style.address} style={{ marginBottom: 20 }}>
			<ShippingFields order={order} shippingMethod={shippingMethod} />
			<div>
				<label>{messages.address}: </label>
				{address.address}
			</div>
		</div>
	);
};

const BillingAddress = ({ address, settings }) => {
	const billinsAddressIsEmpty = address.address === '';

	if (billinsAddressIsEmpty && settings.hide_billing_address) {
		return null;
	} else if (billinsAddressIsEmpty && !settings.hide_billing_address) {
		return (
			<div>
				<Divider
					style={{
						marginTop: 30,
						marginBottom: 30,
						marginLeft: -30,
						marginRight: -30
					}}
				/>
				<div style={{ paddingBottom: 16, paddingTop: 0 }}>
					{messages.billingAddress}
				</div>
				<div className={style.address}>
					<label>{messages.sameAsShipping}</label>
				</div>
			</div>
		);
	} else {
		return (
			<div>
				<Divider
					style={{
						marginTop: 30,
						marginBottom: 30,
						marginLeft: -30,
						marginRight: -30
					}}
				/>
				<div style={{ paddingBottom: 16, paddingTop: 0 }}>
					{messages.billingAddress}
				</div>
				<div className={style.address}>
					<div>{address.fullName}</div>
					<div>{address.address}</div>
					<div>{address.phone}</div>
					<div>{address.company}</div>
				</div>
			</div>
		);
	}
};

export default class OrderCustomer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openShippingEdit: false
		};
	}

	showShippingEdit = () => {
		this.setState({ openShippingEdit: true });
	};

	hideShippingEdit = () => {
		this.setState({ openShippingEdit: false });
	};

	saveShippingEdit = address => {
		this.props.onShippingAddressUpdate(address);
		this.hideShippingEdit();
	};

	render() {
		const { order, settings } = this.props;

		const allowEdit = order.closed === false && order.cancelled === false;
		let mapAddress = order.shippingAddress
			? `${order.shippingAddress.address}`
			: '';
		mapAddress = mapAddress.replace(/ /g, '+');
		const mapUrl = `https://www.google.com/maps/place/${mapAddress}`;

		return (
			<div>
				<div style={{ margin: 20, color: 'rgba(0, 0, 0, 0.52)' }}>
					{messages.customer}
				</div>
				<Paper className="paper-box" zDepth={1}>
					<div className={style.innerBox}>
						<div className={style.address}>
							<div>
								<Link
									to={`/admin/customer/${order._id}`}
									className={style.link}
								>
									{order.customerName}
								</Link>
							</div>
							{/* <div>
								<a href={'MailTo:' + order.email} className={style.link}>
									{order.email}
								</a>
							</div> */}
							<div>{`(${order.countryCode})${order.customerMobile}`}</div>
						</div>

						<Divider
							style={{
								marginTop: 30,
								marginBottom: 30,
								marginLeft: -30,
								marginRight: -30
							}}
						/>

						<div style={{ paddingBottom: 16, paddingTop: 0 }}>
							{messages.shippingAddress}
						</div>
						{order.shippingAddress ? (
							<ShippingAddress order={order} settings={settings} />
						) : (
							''
						)}

						{allowEdit && (
							<RaisedButton
								label={messages.edit}
								style={{ marginRight: 15 }}
								onClick={this.showShippingEdit}
							/>
						)}
						{order.billingAddress ? (
							<a href={mapUrl} target="_blank">
								<FlatButton label="View map" />
							</a>
						) : (
							''
						)}
						{order.billingAddress ? (
							<BillingAddress
								address={order.billingAddress}
								settings={settings}
							/>
						) : (
							''
						)}
						{order.shippingAddress ? (
							<Dialog
								title={messages.shippingAddress}
								modal={false}
								open={this.state.openShippingEdit}
								onRequestClose={this.hideShippingEdit}
								autoScrollBodyContent={true}
								contentStyle={{ width: 600 }}
							>
								<ShippingAddressForm
									initialValues={order.shippingAddress}
									onCancel={this.hideShippingEdit}
									onSubmit={this.saveShippingEdit}
									shippingMethod={order.shipping_method_details}
								/>
							</Dialog>
						) : (
							''
						)}
					</div>
				</Paper>
			</div>
		);
	}
}
