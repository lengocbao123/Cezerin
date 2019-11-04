import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import * as helper from '../../lib/helper';
import { themeSettings, text } from '../../lib/settings';
import Disqus from '../comments/disqus';
import ViewedProducts from '../products/viewed';
import Breadcrumbs from './breadcrumbs';
import DiscountCountdown from './discountCountdown';
import AddToCartButton from './addToCartButton';
import Attributes from './attributes';
import Gallery from './gallery';
import Options from './options';
import Price from './price';
import Quantity from './quantity';
import RelatedProducts from './relatedProducts';
import Tags from './tags';
import axios from 'axios';
import { baseUrl } from '../../../../config/admin';
const Description = ({ description }) => (
	<div
		className="product-content"
		dangerouslySetInnerHTML={{ __html: description }}
	/>
);

export default class ProductDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedOptions: {},
			selectedVariant: null,
			isAllOptionsSelected: false,
			quantity: 1,
			options: []
		};

		this.onOptionChange = this.onOptionChange.bind(this);
		this.findVariantBySelectedOptions = this.findVariantBySelectedOptions.bind(
			this
		);
		this.addToCart = this.addToCart.bind(this);
		this.checkSelectedOptions = this.checkSelectedOptions.bind(this);
		this.getVariantItemOptionName = this.getVariantItemOptionName.bind(this);
	}

	onOptionChange(optionId, valueId) {
		let { selectedOptions } = this.state;

		if (valueId === '') {
			delete selectedOptions[optionId];
		} else {
			selectedOptions[optionId] = valueId;
		}

		this.setState({ selectedOptions: selectedOptions });
		this.findVariantBySelectedOptions();
		this.checkSelectedOptions();
	}

	findVariantBySelectedOptions() {
		const { selectedOptions } = this.state;
		const { product } = this.props;
		for (const variant of product.variants) {
			const variantMutchSelectedOptions = variant.options.every(
				variantOption =>
					selectedOptions[variantOption.option_id] === variantOption.value_id
			);
			if (variantMutchSelectedOptions) {
				this.setState({ selectedVariant: variant });
				return;
			}
		}

		this.setState({ selectedVariant: null });
	}

	setQuantity = quantity => {
		this.setState({ quantity: quantity });
	};
	getVariantItemOptionName(item) {
		let productOptions = this.props.product.options;
		let options = [];
		item.options.map(item => {
			let optionName;
			let optionValue;
			productOptions.map(productOption => {
				if (productOption.id === item.option_id) {
					optionName = productOption.name;
					productOption.values.map(value => {
						if (value.id === item.value_id) {
							optionValue = value.name;
							options = [...options, { name: optionName, value: optionValue }];
						}
					});
				}
			});
		});
		return options;
	}
	addToCart() {
		const { product, addCartItem } = this.props;
		const { selectedVariant, quantity } = this.state;

		let item;

		if (selectedVariant) {
			let itemVariant;
			product.variants.map(item => {
				if (item.id == selectedVariant.id) {
					itemVariant = item;
				}
			});
			let options = this.getVariantItemOptionName(itemVariant);
			let variant_name = [];
			options.map(option => {
				variant_name.push(`${option.name}: ${option.value}`);
			});
			item = {
				id: new Date().getTime(),
				product_id: product.id,
				quantity: quantity,
				sku: itemVariant.sku,
				variant_id: selectedVariant.id,
				variant_name: variant_name.join(', '),
				variantStockQuantity: itemVariant.stock_quantity
			};
		} else {
			item = {
				id: new Date().getTime(),
				product_id: product.id,
				sku: product.sku,
				quantity: quantity,
				variantStockQuantity: 0,
				productStockQuantity: product.stock_quantity,
				variant_id: null,
				variant_name: null
			};
		}
		addCartItem(item);
	}

	checkSelectedOptions() {
		const { selectedOptions } = this.state;
		const { product } = this.props;

		const allOptionsSelected =
			Object.keys(selectedOptions).length === product.options.length;
		this.setState({ isAllOptionsSelected: allOptionsSelected });
	}

	render() {
		const { product, settings, categories } = this.props;
		const { selectedVariant, isAllOptionsSelected } = this.state;
		const maxQuantity =
			product.stock_status === 'discontinued'
				? 0
				: product.stock_backorder
					? themeSettings.maxCartItemQty
					: selectedVariant
						? selectedVariant.stock_quantity
						: product.stock_quantity;

		if (product) {
			return (
				<Fragment>
					<section className="section section-product">
						<div className="container">
							<div className="columns">
								<div className="column is-7">
									{themeSettings.show_product_breadcrumbs && (
										<Breadcrumbs product={product} categories={categories} />
									)}
									<Gallery images={product.images} />
								</div>
								<div className="column is-5">
									<div className="content">
										<Tags tags={product.tags} />
										<h1 className="title is-4 product-name">{product.name}</h1>
										<Price
											product={product}
											variant={selectedVariant}
											isAllOptionsSelected={isAllOptionsSelected}
											settings={settings}
										/>

										{themeSettings.show_discount_countdown &&
											product.on_sale === true && (
												<DiscountCountdown product={product} />
											)}

										<Options
											options={product.options}
											onChange={this.onOptionChange}
										/>
										<Quantity
											maxQuantity={maxQuantity}
											onChange={this.setQuantity}
										/>
										<div className="button-addtocart">
											<AddToCartButton
												product={product}
												variant={selectedVariant}
												addCartItem={this.addToCart}
												isAllOptionsSelected={isAllOptionsSelected}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section className="section section-product-description">
						<div className="container">
							<div className="content">
								<div className="columns">
									<div className="column is-7">
										<Description description={product.description} />
									</div>
									<div className="column is-5">
										<Attributes attributes={product.attributes} />
									</div>
								</div>
							</div>
						</div>
					</section>

					<RelatedProducts
						settings={settings}
						addCartItem={this.addToCart}
						ids={product.related_product_ids}
						limit={10}
					/>

					{themeSettings.show_viewed_products && (
						<ViewedProducts
							settings={settings}
							addCartItem={this.addToCart}
							product={product}
							limit={themeSettings.limit_viewed_products || 4}
						/>
					)}

					{themeSettings.disqus_shortname &&
						themeSettings.disqus_shortname !== '' && (
							<section className="section">
								<div className="container">
									<Disqus
										shortname={themeSettings.disqus_shortname}
										identifier={product.id}
										title={product.name}
										url={product.url}
									/>
								</div>
							</section>
						)}
				</Fragment>
			);
		} else {
			return null;
		}
	}
}
