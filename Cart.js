/* eslint-disable no-mixed-operators */
/**
 *
 * OrderModal
 *
 */

import Spinner from 'components/Spinner'
import 'flatpickr/dist/themes/confetti.css'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import querystring from 'querystring'
import React from 'react'
import ReactModal from 'react-modal'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import ReactSelect from 'react-select'
import 'react-select/dist/react-select.css'
import { formatCurrency, getValidUtm } from 'utils/commons'
import { dtCart } from 'utils/dataLayer'
import CartActions from '../../redux/cartRedux'
import { getRate, PayByCard, PayByFeCredit } from '../../utils/FeCredit'
import { imageProxy } from '../../utils/imageProxy'
import * as api from '../../services/cartApi'

import acb from './images/acb.jpg'
import anz from './images/anz.jpg'
import bidv from './images/bidv.jpg'
import citi from './images/citibank.jpg'
import EmptyCart from './images/empty-cart.svg'
import exim from './images/eximbank.jpg'
// import Finance from './images/money.png'
// import Credit from './images/debit-card.png'
import FeCredit from './images/feCredit.jpg'
import HdSaison from './images/hdf-logo.jpg'
import hsbc from './images/hsbc.jpg'
import jcb from './images/jcb.jpg'
import kienlong from './images/kienlong.jpg'
import masteredcard from './images/masteredcard.jpg'
import mb from './images/mbbank.jpg'
import msb from './images/msb.jpg'
import nama from './images/namabank.jpg'
import ocb from './images/ocb.jpg'
import PayLater from './images/paylater.png'
import sacom from './images/sacombank.jpg'
import scb from './images/scb.jpg'
import sea from './images/seabank.jpg'
import shb from './images/shb.jpg'
import shinhan from './images/shinhan.jpg'
import techcom from './images/techcombank.jpg'
import tp from './images/tpbank.jpg'
import vib from './images/vib.jpg'
import vcb from './images/vietcombank.jpg'
import visacard from './images/visacard.jpg'
import vp from './images/vpbank.jpg'
import HomeCredit from './images/homeCredit.jpg'
import { locations } from '..//../containers/Cart/locations'
import './style.scss'

ReactModal.setAppElement('#app')

const md5 = require('md5')

const PAYMENT = {
  CASH: 'CASH',
  CREDIT_CARD: 'CARD',
  BANK_TRANSFER: 'BANK',
}

const CARDTYPE = [
  {
    logo: visacard,
    name: 'Visa',
  },
  {
    logo: masteredcard,
    name: 'MasterCard',
  },
  {
    logo: jcb,
    name: 'JCB',
  },
]

const LISTBANK = [
  {
    logo: acb,
    name: 'ACB',
  },
  {
    logo: anz,
    name: 'ANZ',
  },
  {
    logo: bidv,
    name: 'BIDV',
  },
  {
    logo: citi,
    name: 'citibank',
  },
  {
    logo: exim,
    name: 'EXIMBANK',
  },

  {
    logo: hsbc,
    name: 'HSBC',
  },
  {
    logo: kienlong,
    name: 'KIENLONG BANK',
  },

  {
    logo: mb,
    name: 'MB',
  },
  {
    logo: msb,
    name: 'MSB',
  },
  {
    logo: nama,
    name: 'NAM A BANK',
  },
  {
    logo: ocb,
    name: 'OCB',
  },
  {
    logo: sacom,
    name: 'Sacombank',
  },
  {
    logo: scb,
    name: 'SCB',
  },
  {
    logo: sea,
    name: 'SeABank',
  },
  {
    logo: shb,
    name: 'SHB',
  },
  {
    logo: shinhan,
    name: 'Shinhan Bank',
  },
  {
    logo: techcom,
    name: 'TECHCOMBANK',
  },
  {
    logo: tp,
    name: 'TPBank',
  },
  {
    logo: vib,
    name: 'VIB',
  },
  {
    logo: vcb,
    name: 'Vietcombank',
  },
  {
    logo: vp,
    name: 'VPBank',
  },
  {
    logo: FeCredit,
    name: 'FECredit',
  },
  {
    logo: HomeCredit,
    name: 'HomeCredit',
  },
]

class Cart extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props)
    this.state = {
      isModalOpen: false,
      customerData: {
        address: '',
        name: '',
        phone: '',
        email: '',
        gender: 'MALE',
      },
      orderData: {
        note: '',
        address: '',
        shop_pickup: false,
        fast_deliver: false,
        delivery_date: new Date(),
        delivery_time: new Date(),
        payment_method: PAYMENT.CASH,
        is_instalment: true,
        warehouse_id: null,
      },
      extraData: {},
      isInstalment: true,
      error: {
        name: '',
        phone: '',
      },
      isBuying: false,
      activeTab: 'fe',
      isMoreInfo: false,
      numberOfMonth: 6,
      numberOfPaied: 30,

      feCreditPaper: 'CMND+Hộ khẩu',
      hdSaisonPaper: 'CMND+Hộ khẩu',

      bankSelected: 'ACB',
      cardSelected: '',
      totalCost: 0,
      isSelecting: true,
      paiedCost: 0,
      selectedCompany: '',
      city: '',
      district: '',
      ward: '',
    }
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.renderProductEmpty = this.renderProductEmpty.bind(this)
    this.renderProduct = this.renderProduct.bind(this)
    this.calcPrice = this.calcPrice.bind(this)
    this.onCustomerDataChange = this.onCustomerDataChange.bind(this)
    this.onOrderDataChange = this.onOrderDataChange.bind(this)
    this.placeOrder = this.placeOrder.bind(this)
    this.renderTabPayment = this.renderTabPayment.bind(this)
    this.onChangeTab = this.onChangeTab.bind(this)
  }

  componentWillMount() {
    const search = get(this.props, ['location', 'search'])
    if (search) {
      const params = querystring.parse(search.slice(1))
      this.setState({
        isInstalment: get(params, 'instalment', true),
        activeTab: get(params, 'method', '') === 'bank' ? 'credit' : 'fe',
      })
    }
    //   const query = get(this.props, ['location', 'search'])
    //   this.props.productDetailRequest(query.slice(3))
  }

  componentDidMount() {
    if (this.props.products.length > 0) {
      dtCart(this.props.products, this.props.detail, this.calcPrice())
    }
  }

  onCustomerDataChange(props) {
    const { customerData } = this.state
    this.setState({
      customerData: {
        ...customerData,
        ...props,
      },
    })
  }

  onOrderDataChange(props) {
    const { orderData } = this.state

    this.setState({
      orderData: {
        ...orderData,
        ...props,
      },
    })
  }

  onChangeTab(tab) {
    this.setState({ activeTab: tab })
  }

  show(isInstalment = false) {
    this.setState({ isModalOpen: true, isInstalment })
  }

  hide() {
    this.setState({ isModalOpen: false })
  }

  calcPrice() {
    const { productsInstalment, detail } = this.props
    let total = 0
    const count = 1
    const additionalPrice = get(
      detail,
      [productsInstalment.id, 'warranty', 'ProductWarranty', 'additionalPrice'],
      0
    )
    let discountPrice = get(detail, [
      productsInstalment.id,
      'option',
      'retailPrice',
    ])
    discountPrice += additionalPrice
    total += count * discountPrice

    return total
  }

  validate(name, phone, address) {
    const error = this.state.error
    const { orderData } = this.state
    name = name.trim()
    phone = phone.trim()
    error.name = !name.trim()
    error.phone =
      phone.length < 8 || !/^[0]\d+$/.test(phone) || phone.length > 10
    if (!orderData.shop_pickup) {
      error.address = !address
    }
    this.setState({ error })
    return error.name || error.phone || error.address
  }

  placeOrder(e) {
    e.preventDefault()
    this.setState({ isBuying: true })
    const { detail, productsInstalment, placeOrderRequest } = this.props
    const {
      customerData,
      orderData,
      activeTab,
      numberOfMonth,
      paiedCost,
      selectedCompany,
      bankSelected,
      cardSelected,
      city,
      ward,
      district,
    } = this.state
    const orderLineItems = [productsInstalment].map((product) => ({
      product_id: product.id,
      option_id: get(get(detail, [product.id, 'option']), 'id', null),
      warranty_id: get(get(detail, [product.id, 'warranty']), 'id', null),
      amount: 1,
    }))

    if (
      this.validate(customerData.name, customerData.phone, orderData.address)
    ) {
      this.setState({ isBuying: false })
    }

    let getExtraData = {
      utm: getValidUtm(),
    }

    if (activeTab === 'fe') {
      getExtraData = {
        ...getExtraData,
        soThangTraGop: numberOfMonth,
        traTruoc: paiedCost,
        cty: selectedCompany,
      }
    } else {
      getExtraData = {
        ...getExtraData,
        nganHang: bankSelected,
        loaiThe: cardSelected,
        soThangTraGop: numberOfMonth,
      }
    }

    const infoCustomer = {
      ...customerData,
    }

    // delete orderData.address
    const newOrderData = {
      ...orderData,
    }
    const params = {
      customerData: infoCustomer,
      orderData: {
        ...newOrderData,
        address:
          city === 'Tỉnh khác'
            ? `${orderData.address}`
            : `${orderData.address}, ${ward}, ${district}, ${city}`,
        extra_data: getExtraData,
        payment_method:
          activeTab === 'fe' ? PAYMENT.CREDIT_CARD : PAYMENT.BANK_TRANSFER,
      },
      items: orderLineItems,
    }

    placeOrderRequest(params, () => {
      if (this.completeButton) {
        this.completeButton.click()
      }
      this.setState(
        {
          isModalOpen: false,
          customerData: {
            name: '',
            phone: '',
            email: '',
            address: '',
          },
          orderData: {
            note: '',
            address: '',
            shop_pickup: false,
            fast_deliver: false,
            delivery_date: new Date(),
            delivery_time: new Date(),
            payment_method: PAYMENT.CASH,
            warehouse_id: null,
          },
          isBuying: false,
        },
        () => {
          this.props.history.push({
            pathname: '/dat-mua',
            state: {
              isOrder: this.props.location.pathname === '/dat-hang',
            },
          })
        }
      )
    })
  }

  openMoreInfo = () => {
    const { isMoreInfo } = this.state
    this.setState({ isMoreInfo: !isMoreInfo })
  };

  selectNumberOfMonth = (value) => {
    this.setState({ numberOfMonth: value, selectedCompany: '' })
  };

  buttonPaylater = () => {
    const { numberOfMonth } = this.state
    const { productsInstalment, detail } = this.props
    const openWindow = window.open()
    const dataId =
      new Date().getTime() + Math.random().toString().substring(2, 6)
    const product = detail[productsInstalment.id] || {}
    api
      .redirectPaylater({
        url: 'https://paylater.vn',
        client_id: 4623457610,
        order_id: dataId,
        sum: get(product, 'option.retailPrice', 0) * get(product, 'count', 1),
        goods: encodeURI(
          JSON.stringify([
            {
              Name: get(productsInstalment, 'name', ''),
              Category: get(productsInstalment, 'Category.name', ''),
              Price: get(product, 'option.retailPrice', 0),
              Count: get(product, 'count', 1),
            },
          ])
        ),
        token: md5(`dienthoaigiakhoad36051b3d5198b3f784ab64023ce15b${dataId}`),
        tariff_id: `${numberOfMonth === 6 ? '010' : '001'}`,
      })
      .then((res) => {
        if (get(res, 'data.RETURN_URL', '') !== '') {
          openWindow.location = get(res, 'data.RETURN_URL', '')
        } else {
          openWindow.close()
        }
      })
  };

  renderProductEmpty() {
    return (
      <div className="product-empty">
        <img src={EmptyCart} alt="icon" />
        <div className="text-empty">Không có sản phẩm nào trong giỏ hàng</div>
        <Link to="/">
          <button>Về trang chủ</button>
        </Link>
        <div>
          Khi cần trợ giúp vui lòng gọi <a>1900-8922</a> (7h30 - 22h)
        </div>
      </div>
    )
  }

  renderPaylaterCompany = (month) => month === 6 || month === 12;

  renderProduct() {
    const {
      detail,
      productsInstalment,
      // addProductToCart,
      // descreceProductCountOnCart,
      removeProductInstalment,
    } = this.props
    // const { paiedCost, isSelecting } = this.state
    const count = 1
    const additionalPrice = get(
      detail,
      [productsInstalment.id, 'warranty', 'ProductWarranty', 'additionalPrice'],
      0
    )
    let discountPrice =
      get(detail, [productsInstalment.id, 'option', 'salePrice']) ||
      get(detail, [productsInstalment.id, 'option', 'retailPrice'])
    discountPrice += additionalPrice
    const activePromotions = get(
      productsInstalment,
      ['activePromotions'],
      []
    ).sort(
      (a, b) => a.ProductNewPromotion.orderIdx - b.ProductNewPromotion.orderIdx
    )

    return (
      <div className="product" key={productsInstalment.id}>
        <div className="product-info">
          <div className="product-thumb">
            <div className="product-photo">
              <img
                alt="thumb"
                src={imageProxy(
                  get(
                    detail,
                    [productsInstalment.id, 'option', 'images', '0'],
                    ''
                  ),
                  { w: 100 }
                )}
              />
              <button
                className="btn-remove"
                onClick={() =>
                  removeProductInstalment(productsInstalment.id, this.hide)
                }
              >
                Xóa khỏi giỏ hàng
              </button>
            </div>
            <div className="info-type">
              <div>Mua trả góp</div>
              <div className="name">{productsInstalment.name}</div>
              <div className="options">
                {get(detail, [productsInstalment.id, 'option', 'name'], '') && (
                  <div className="color">
                    {get(detail, [productsInstalment.id, 'option', 'name'])}
                    <div className="price">
                      {formatCurrency(
                        get(detail, [
                          productsInstalment.id,
                          'option',
                          'salePrice',
                        ])
                      )}
                    </div>
                  </div>
                )}
                <div className="product-quantity">
                  {/* <div className="quantity">
                    <button
                      disabled={!isSelecting}
                      style={{ cursor: !isSelecting && 'not-allowed' }}
                      onClick={() =>
                        descreceProductCountOnCart(
                          productsInstalment.id,
                          get(detail, [productsInstalment.id])
                        )
                      }
                    >
                      -
                    </button>
                    <div className="txt-quantity">{count}</div>
                    <button
                      disabled={!isSelecting}
                      style={{ cursor: !isSelecting && 'not-allowed' }}
                      onClick={() =>
                        addProductToCart(
                          productsInstalment,
                          get(detail, [productsInstalment.id, 'option']),
                          get(detail, [productsInstalment.id, 'warranty'])
                        )
                      }
                    >
                      +
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="uu-dai">
            {!(
              activePromotions.length === 0 &&
              get(productsInstalment, 'preferences', []).length === 0
            ) && (
              <div className="preferences">
                <div className="title-promotion">Ưu đãi của bạn</div>
                {activePromotions.map((description, index) => (
                  <div className="info-2" key={index}>
                    <i className="fa fa-check-circle" />
                    <div className="txt-info">{description.name}</div>
                  </div>
                ))}
                {get(productsInstalment, 'preferences', []).map(
                  (preference) => (
                    <div className="info-2" key={preference.id}>
                      <i className="fa fa-check-circle" />
                      <div className="txt-info">{preference.name}</div>
                    </div>
                  )
                )}
                {get(
                  detail,
                  [productsInstalment.id, 'warranty', 'name'],
                  ''
                ) && (
                  <div className="info-2">
                    <i className="fa fa-check-circle" />
                    <div className="txt-info">
                      {get(
                        detail,
                        [productsInstalment.id, 'warranty', 'name'],
                        ''
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <React.Fragment>
            <div className="price-total">
              {/* <div className="paid">
                <span>Trả trước</span>
                <span>{formatCurrency(paiedCost)}</span>
              </div> */}
              <div className="total">
                <span>Tổng tiền</span>
                <span>{formatCurrency(discountPrice * count)}</span>
              </div>
            </div>
          </React.Fragment>
        </div>
      </div>
    )
  }

  renderTabPayment() {
    const {
      activeTab,
      isMoreInfo,
      numberOfMonth,
      numberOfPaied,
      feCreditPaper,
      hdSaisonPaper,
      bankSelected,
      cardSelected,
    } = this.state
    const { detail, productsInstalment } = this.props
    const count = 1
    const additionalPrice = get(
      detail,
      [productsInstalment.id, 'warranty', 'ProductWarranty', 'additionalPrice'],
      0
    )
    let discountPrice =
      get(detail, [productsInstalment.id, 'option', 'retailPrice']) * count
    discountPrice += additionalPrice
    const paiedCost = discountPrice * (numberOfPaied / 100)

    // Rate
    const rateFeCredit = feCreditPaper === 'CMND+Hộ khẩu' ? 4.58 : 2.92
    const rateHdSaison = getRate(
      numberOfPaied,
      discountPrice - paiedCost,
      hdSaisonPaper,
      numberOfMonth
    )
    const ratePayLater = numberOfMonth === 6 || numberOfMonth === 12 ? 5.99 : 0

    // Bảo hiểm
    const baoHiemFe = (discountPrice - paiedCost) * 0.05
    const baoHiemHd = ((discountPrice - paiedCost) * 0.05) / 12

    // Trả mỗi tháng
    const monthlyPayment =
      PayByFeCredit(
        rateHdSaison / 100,
        numberOfMonth,
        -(discountPrice - paiedCost),
        0,
        0
      ) +
      12000 +
      baoHiemHd
    const monthlyPaymentFe =
      PayByFeCredit(
        rateFeCredit / 100,
        numberOfMonth,
        -(discountPrice - paiedCost + baoHiemFe),
        0,
        0
      ) + 12000
    const monthlyPaymentPayLater =
      (discountPrice - discountPrice * 0.3) * (ratePayLater / 100) +
      (discountPrice - discountPrice * 0.3) / numberOfMonth

    // Tổng thanh toán
    const totalPayment = monthlyPayment * numberOfMonth + paiedCost
    const totalPaymentFe = monthlyPaymentFe * numberOfMonth + paiedCost
    const totalPaymentPayLater =
      monthlyPaymentPayLater * numberOfMonth + discountPrice * 0.3

    // Chênh lệch
    const chenhLech = totalPayment - discountPrice
    const chenhLechFe = totalPaymentFe - discountPrice
    const chenhLechPayLater = totalPaymentPayLater - discountPrice

    const threeMonth = PayByCard(discountPrice, 3, bankSelected, cardSelected)
    const sixMonth = PayByCard(discountPrice, 6, bankSelected, cardSelected)
    const nineMonth = PayByCard(discountPrice, 9, bankSelected, cardSelected)
    const twelveMonth = PayByCard(
      discountPrice,
      12,
      bankSelected,
      cardSelected
    )

    const numberMethod = [rateFeCredit, rateHdSaison, ratePayLater].filter(
      (item) => item > 0
    ).length
    return (
      <div id="table-smooth" className="method-payment-container">
        <div className={`select-tab ${activeTab}`}>
          <div
            role="presentation"
            className={`tab-item ${activeTab === 'fe' ? 'active-tab' : ''}`}
            onClick={() => this.onChangeTab('fe')}
          >
            {/* <img alt="icon" src={Finance} /> */}
            <div className="method-name">
              <div className="name">CÔNG TY TÀI CHÍNH</div>
              <div className="description-method">
                Xét duyệt online, thủ tục đơn giản
              </div>
            </div>
          </div>
          <div
            role="presentation"
            className={`tab-item ${activeTab === 'credit' ? 'active-tab' : ''}`}
            onClick={() => this.onChangeTab('credit')}
          >
            {/* <img alt="icon" src={Credit} /> */}
            <div className="method-name">
              <div className="name">QUA THẺ TÍN DỤNG</div>
              <div className="description-method">
                Không cần xét duyệt, hỗ trợ Visa, Master, JCB
              </div>
            </div>
          </div>
        </div>
        <div className="body-method">
          {activeTab === 'fe' ? (
            <div>
              <div className="info">
                {/* Các kì hạn có gói <strong style={{ color: 'red' }}>Trả góp 0% - 1%</strong>: 4 tháng <br /> */}
                <strong style={{ marginTop: 7 }}>Chọn số tháng trả góp</strong>
              </div>
              <div className="list-time">
                <div
                  role="presentation"
                  onClick={() => this.selectNumberOfMonth(6)}
                  className={`time-item${
                    numberOfMonth === 6 ? ' time-active' : ''
                  }`}
                >
                  6 tháng
                </div>
                <div
                  role="presentation"
                  onClick={() => this.selectNumberOfMonth(8)}
                  className={`time-item${
                    numberOfMonth === 8 ? ' time-active' : ''
                  }`}
                >
                  8 tháng
                </div>
                <div
                  role="presentation"
                  onClick={() => this.selectNumberOfMonth(9)}
                  className={`time-item${
                    numberOfMonth === 9 ? ' time-active' : ''
                  }`}
                >
                  9 tháng
                </div>
                <div
                  role="presentation"
                  onClick={() => this.selectNumberOfMonth(10)}
                  className={`time-item${
                    numberOfMonth === 10 ? ' time-active' : ''
                  }`}
                >
                  10 tháng
                </div>
                <div
                  role="presentation"
                  onClick={() => this.selectNumberOfMonth(12)}
                  className={`time-item${
                    numberOfMonth === 12 ? ' time-active' : ''
                  }`}
                >
                  12 tháng
                </div>
              </div>
              <div className={`tablecontent method-${numberMethod}`}>
                <ul
                  className="table"
                  style={{
                    minWidth:
                      [rateFeCredit, rateHdSaison, ratePayLater].filter(
                        (item) => item > 0
                      ).length === 1
                        ? 'unset'
                        : '620px',
                  }}
                >
                  <li>
                    <div className="axies">Công ty</div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies logo pay-pater-logo">
                        <img src={PayLater} alt="card" />
                      </div>
                    ) : null}
                    {
                      <div className="axies logo">
                        <img src={FeCredit} alt="card" />
                      </div>
                    }
                    {
                      <div className="axies logo">
                        <img src={HdSaison} alt="card" />
                      </div>
                    }
                  </li>
                  <li>
                    <div className="axies">Giá sản phẩm</div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies">
                        {formatCurrency(discountPrice)}
                      </div>
                    ) : null}
                    {
                      <div className="axies">
                        {formatCurrency(discountPrice)}
                      </div>
                    }
                    {
                      <div className="axies">
                        {formatCurrency(discountPrice)}
                      </div>
                    }
                  </li>
                  <li>
                    <div className="axies">Giá mua trả góp</div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies">
                        <span className="mark-style">
                          {formatCurrency(discountPrice)}
                        </span>
                      </div>
                    ) : null}
                    {
                      <div className="axies">
                        <span className="mark-style">
                          {formatCurrency(discountPrice)}
                        </span>
                      </div>
                    }
                    {
                      <div className="axies">
                        <span className="mark-style">
                          {rateHdSaison !== 0
                            ? formatCurrency(discountPrice)
                            : 'Không hỗ trợ'}
                        </span>
                      </div>
                    }
                  </li>
                  <li>
                    <div className="axies paied">
                      Trả trước :
                      <ReactSelect
                        value={numberOfPaied}
                        placeholder="Chọn gói trả trước"
                        clearable={false}
                        className="warranty-package-select mobile-width"
                        options={
                          window.innerWidth > 480
                            ? [
                              {
                                label: `10% ~ ${formatCurrency(
                                    discountPrice * 0.1
                                  )}`,
                                id: '10',
                              },
                              {
                                label: `20% ~ ${formatCurrency(
                                    discountPrice * 0.2
                                  )}`,
                                id: '20',
                              },
                              {
                                label: `30% ~ ${formatCurrency(
                                    discountPrice * 0.3
                                  )}`,
                                id: '30',
                              },
                              {
                                label: `40% ~ ${formatCurrency(
                                    discountPrice * 0.4
                                  )}`,
                                id: '40',
                              },
                              {
                                label: `50% ~ ${formatCurrency(
                                    discountPrice * 0.5
                                  )}`,
                                id: '50',
                              },
                              {
                                label: `60% ~ ${formatCurrency(
                                    discountPrice * 0.6
                                  )}`,
                                id: '60',
                              },
                              {
                                label: `70% ~ ${formatCurrency(
                                    discountPrice * 0.7
                                  )}`,
                                id: '70',
                              },
                            ]
                            : [
                                { label: '10%', id: '10' },
                                { label: '20%', id: '20' },
                                { label: '30%', id: '30' },
                                { label: '40%', id: '40' },
                                { label: '50%', id: '50' },
                                { label: '60%', id: '60' },
                                { label: '70%', id: '70' },
                            ]
                        }
                        labelKey="label"
                        valueKey="id"
                        onChange={(numberOfPaied) => {
                          if (numberOfPaied === null) {
                            this.setState({ numberOfPaied: 10 })
                          } else {
                            if (
                              getRate(
                                Number(numberOfPaied.id),
                                discountPrice -
                                  discountPrice *
                                    (Number(numberOfPaied.id) / 100),
                                hdSaisonPaper,
                                numberOfMonth
                              ) === 0
                            ) {
                              if (hdSaisonPaper === 'CMND+Hộ khẩu') {
                                this.setState({
                                  hdSaisonPaper:
                                    'CMND+Hộ khẩu+Hóa đơn điện nước',
                                })
                              } else {
                                this.setState({
                                  hdSaisonPaper: 'CMND+Hộ khẩu',
                                })
                              }
                            }
                            this.setState({
                              numberOfPaied: numberOfPaied
                                ? Number(numberOfPaied.id)
                                : 0,
                            })
                          }
                        }}
                      />
                    </div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies">{`${formatCurrency(
                        discountPrice * (30 / 100)
                      )} (30%)`}</div>
                    ) : null}
                    {
                      <div className="axies">{`${formatCurrency(
                        discountPrice * (numberOfPaied / 100)
                      )} (${numberOfPaied}%)`}</div>
                    }
                    {
                      <div className="axies">
                        {rateHdSaison !== 0
                          ? `${formatCurrency(
                              discountPrice * (numberOfPaied / 100)
                            )} (${numberOfPaied}%)`
                          : ''}
                      </div>
                    }
                  </li>
                  <li>
                    <div className="axies">Lãi suất thực / phẳng</div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies">5.99%</div>
                    ) : null}
                    {
                      <div className="axies">{`${
                        rateFeCredit === 4.58 ? 3.64 : 2.32
                      }%`}</div>
                    }
                    {
                      <div className="axies">
                        {rateHdSaison !== 0 ? (
                          <span className="special-percent">
                            {`${rateHdSaison}%`}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                    }
                  </li>
                  <li>
                    <div className="axies">Giấy tờ cần có</div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies">
                        <div>
                          Chứng minh nhân dân <br />{' '}
                          <a
                            className="huong-dan"
                            target="_blank"
                            href="https://dienthoaigiakho.vn/tra-gop/tra-gop-online-qua-paylater"
                          >
                            (Xem hướng dẫn chi tiết)
                          </a>
                        </div>
                      </div>
                    ) : null}
                    {
                      <div className="axies" id="asidepaper">
                        <ReactSelect
                          value={feCreditPaper}
                          className="warranty-package-select full-width"
                          clearable={false}
                          options={[
                            { label: 'CMND+Hộ khẩu', id: 'CMND+Hộ khẩu' },
                            {
                              label: 'CMND+Hộ khẩu+Hóa đơn điện nước',
                              id: 'CMND+Hộ khẩu+Hóa đơn điện nước',
                            },
                          ]}
                          labelKey="label"
                          valueKey="id"
                          onChange={(feCreditPaper) => {
                            this.setState({
                              feCreditPaper: feCreditPaper
                                ? feCreditPaper.id
                                : 'CMND+Hộ khẩu',
                            })
                          }}
                        />
                      </div>
                    }
                    {
                      <div className="axies">
                        {/* <ReactSelect
                          value={hdSaisonPaper}
                          className="warranty-package-select full-width"
                          options={
                          [
                            { label: 'CMND+Hộ khẩu', id: 'CMND+Hộ khẩu' },
                            { label: 'CMND+Hộ khẩu+Hóa đơn điện nước', id: 'CMND+Hộ khẩu+Hóa đơn điện nước' },
                          ]
                          }
                          labelKey="label"
                          valueKey="id"
                          onChange={hdSaisonPaper => {
                            this.setState({ hdSaisonPaper: hdSaisonPaper ? hdSaisonPaper.id : 'CMND+Hộ khẩu' })
                          }}
                        /> */}
                        {rateHdSaison !== 0 ? hdSaisonPaper : ''}
                      </div>
                    }
                  </li>
                  <li style={{ display: 'block' }}>
                    <div className="subtable">
                      <div
                        className="axies"
                        role="presentation"
                        onClick={this.openMoreInfo}
                        style={{ display: 'block' }}
                      >
                        Góp mỗi tháng
                        <span className="more-info">Chi tiết</span>
                      </div>
                      {this.renderPaylaterCompany(numberOfMonth) ? (
                        <div className="axies" id="ppm-3">
                          {formatCurrency(monthlyPaymentPayLater)}
                        </div>
                      ) : null}
                      {
                        <div className="axies" id="ppm-3">
                          {formatCurrency(monthlyPaymentFe)}
                        </div>
                      }
                      {
                        <div className="axies" id="ppm-1">
                          {rateHdSaison !== 0
                            ? formatCurrency(monthlyPayment)
                            : ''}
                        </div>
                      }
                    </div>
                    <div className={`infodetail ${isMoreInfo ? 'open' : ''}`}>
                      <div className="row">
                        <div className="axies">Gốc + lãi</div>
                        {this.renderPaylaterCompany(numberOfMonth) ? (
                          <div className="axies" id="ppmnotfee-3">
                            {' '}
                          </div>
                        ) : null}
                        {
                          <div className="axies" id="ppmnotfee-3">
                            {formatCurrency(monthlyPaymentFe - 12000)}
                          </div>
                        }
                        {
                          <div className="axies" id="ppmnotfee-1">
                            {rateHdSaison !== 0
                              ? formatCurrency(monthlyPayment - 12000)
                              : ''}
                          </div>
                        }
                      </div>
                      <div className="row">
                        <div className="axies">Phí thu hộ</div>
                        {this.renderPaylaterCompany(numberOfMonth) ? (
                          <div className="axies"> </div>
                        ) : null}
                        {<div className="axies">12.000₫/tháng</div>}
                        {
                          <div className="axies">
                            {rateHdSaison !== 0 ? '12.000₫/tháng' : ''}
                          </div>
                        }
                      </div>
                      <div className="row">
                        <div className="axies checked" data-value="80000.000">
                          Bảo hiểm
                        </div>
                        {this.renderPaylaterCompany(numberOfMonth) ? (
                          <div className="axies"> </div>
                        ) : null}
                        {
                          <div className="axies">{`${formatCurrency(
                            baoHiemFe
                          )}/tháng`}</div>
                        }
                        {
                          <div className="axies">
                            {rateHdSaison !== 0
                              ? `${formatCurrency(baoHiemHd)}/tháng`
                              : ''}
                          </div>
                        }
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="axies">Tổng tiền phải trả</div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies">
                        <span className="mark-style" id="totalpay-3">
                          {formatCurrency(totalPaymentPayLater)}
                        </span>
                      </div>
                    ) : null}
                    {
                      <div className="axies">
                        <span className="mark-style" id="totalpay-3">
                          {formatCurrency(totalPaymentFe)}
                        </span>
                      </div>
                    }
                    {
                      <div className="axies">
                        <span className="mark-style" id="totalpay-1">
                          {rateHdSaison !== 0
                            ? formatCurrency(totalPayment)
                            : ''}
                        </span>
                      </div>
                    }
                  </li>
                  <li>
                    <div className="axies">Chênh lệch với mua trả thẳng</div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies" id="diffprice-3">
                        {formatCurrency(chenhLechPayLater)}
                      </div>
                    ) : null}
                    {
                      <div className="axies" id="diffprice-3">
                        {formatCurrency(chenhLechFe)}
                      </div>
                    }
                    {
                      <div className="axies" id="diffprice-1">
                        {rateHdSaison !== 0 ? formatCurrency(chenhLech) : ''}
                      </div>
                    }
                  </li>
                  <li className="group-btn">
                    <div className="axies"></div>
                    {this.renderPaylaterCompany(numberOfMonth) ? (
                      <div className="axies logo pay-pater-logo">
                        <a
                          // role="presentation"
                          href="#table-smooth"
                          onClick={() => {
                            this.buttonPaylater()
                            // window.scroll(0, 0)
                          }}
                          className="mua"
                        >
                          Đặt mua
                        </a>
                      </div>
                    ) : null}
                    {
                      <div className="axies logo logo">
                        <a
                          // role="presentation"
                          href="#table-smooth"
                          onClick={() => {
                            this.setState({
                              paiedCost,
                              totalCost: totalPaymentFe,
                              isSelecting: false,
                              selectedCompany: 'FECREDIT',
                            })
                            // window.scroll(0, 0)
                          }}
                          className="mua"
                        >
                          Đặt mua
                        </a>
                      </div>
                    }
                    {
                      <div className="axies logo">
                        {rateHdSaison !== 0 ? (
                          <a
                            // role="presentation"
                            href="#table-smooth"
                            onClick={() => {
                              this.setState({
                                paiedCost,
                                totalCost: totalPayment,
                                isSelecting: false,
                                selectedCompany: 'HDSAISON',
                              })
                              // window.scroll(0, 0)
                            }}
                            className="mua"
                          >
                            Đặt mua
                          </a>
                        ) : (
                          ''
                        )}
                      </div>
                    }
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bank-transfer">
              <div className="watch-detail-info">
                <a
                  href="https://dienthoaigiakho.vn/tra-gop/tra-gop-0-qua-the-tin-dung"
                  target="_blank"
                >
                  Xem chi tiết chương trình
                </a>
              </div>
              <div className="step-one">
                <strong>Bước 1: Chọn ngân hàng trả góp</strong>
              </div>
              <div className="list-img">
                {LISTBANK.map((item) => (
                  <img
                    role="presentation"
                    onClick={() => this.setState({ bankSelected: item.name })}
                    className={`logo-bank ${
                      bankSelected === item.name && 'active'
                    }`}
                    key={item.name}
                    src={item.logo}
                    alt="bank"
                  />
                ))}
              </div>
              <div className="step-two">
                <strong>Bước 2: Chọn loại thẻ</strong>
              </div>
              <div className="list-img card-type">
                {CARDTYPE.map((item) => (
                  <img
                    role="presentation"
                    onClick={() => this.setState({ cardSelected: item.name })}
                    className={`logo-card ${
                      cardSelected === item.name && 'active'
                    }`}
                    key={item.name}
                    src={item.logo}
                    alt="card"
                  />
                ))}
              </div>
              <div
                className={`${
                  bankSelected && cardSelected ? 'open-table' : 'table-payment'
                }`}
              >
                <div className="title">
                  <span>{`Trả góp qua thẻ ${cardSelected}, ngân hàng ${bankSelected}`}</span>
                </div>
                <div className="info-payment">
                  <table className="table-info-payment">
                    <tr>
                      <td>Số tháng trả góp</td>
                      {threeMonth !== 0 && (
                        <td>
                          <b>3 tháng</b>
                        </td>
                      )}
                      {sixMonth !== 0 && (
                        <td>
                          <b>6 tháng</b>
                        </td>
                      )}
                      {nineMonth !== 0 && (
                        <td>
                          <b>9 tháng</b>
                        </td>
                      )}
                      {twelveMonth !== 0 && (
                        <td>
                          <b>12 tháng</b>
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td>Giá mua trả góp</td>
                      {threeMonth !== 0 && (
                        <td>{formatCurrency(discountPrice)}</td>
                      )}
                      {sixMonth !== 0 && (
                        <td>{formatCurrency(discountPrice)}</td>
                      )}
                      {nineMonth !== 0 && (
                        <td>{formatCurrency(discountPrice)}</td>
                      )}
                      {twelveMonth !== 0 && (
                        <td>{formatCurrency(discountPrice)}</td>
                      )}
                    </tr>
                    <tr>
                      <td>Góp mỗi tháng</td>
                      {threeMonth !== 0 && (
                        <td>{formatCurrency(threeMonth / 3)}</td>
                      )}
                      {sixMonth !== 0 && (
                        <td>{formatCurrency(sixMonth / 6)}</td>
                      )}
                      {nineMonth !== 0 && (
                        <td>{formatCurrency(nineMonth / 9)}</td>
                      )}
                      {twelveMonth !== 0 && (
                        <td>{formatCurrency(twelveMonth / 12)}</td>
                      )}
                    </tr>
                    <tr>
                      <td>Tổng tiền trả góp</td>
                      {threeMonth !== 0 && (
                        <td>{formatCurrency(threeMonth)}</td>
                      )}
                      {sixMonth !== 0 && <td>{formatCurrency(sixMonth)}</td>}
                      {nineMonth !== 0 && <td>{formatCurrency(nineMonth)}</td>}
                      {twelveMonth !== 0 && (
                        <td>{formatCurrency(twelveMonth)}</td>
                      )}
                    </tr>
                    <tr>
                      <td>Chênh lệch với mua trả thẳng</td>
                      {threeMonth !== 0 && (
                        <td>{formatCurrency(threeMonth - discountPrice)}</td>
                      )}
                      {sixMonth !== 0 && (
                        <td>{formatCurrency(sixMonth - discountPrice)}</td>
                      )}
                      {nineMonth !== 0 && (
                        <td>{formatCurrency(nineMonth - discountPrice)}</td>
                      )}
                      {twelveMonth !== 0 && (
                        <td>{formatCurrency(twelveMonth - discountPrice)}</td>
                      )}
                    </tr>
                    <tr className="group-btn">
                      <td></td>
                      {threeMonth !== 0 && (
                        <td>
                          <button
                            className={`choosing-btn ${
                              numberOfMonth === 3 ? 'active' : ''
                            } `}
                            href="#table-smooth"
                            onClick={() => {
                              this.setState({
                                totalCost: threeMonth,
                                isSelecting: false,
                                numberOfMonth: 3,
                              })
                              // window.scroll(0, 0)
                            }}
                          >
                            {numberOfMonth === 3 ? 'ĐANG CHỌN' : 'CHỌN MUA'}
                          </button>
                        </td>
                      )}
                      {sixMonth !== 0 && (
                        <td>
                          <button
                            className={`choosing-btn ${
                              numberOfMonth === 6 ? 'active' : ''
                            } `}
                            href="#table-smooth"
                            onClick={() => {
                              this.setState({
                                totalCost: sixMonth,
                                isSelecting: false,
                                numberOfMonth: 6,
                              })
                              // window.scroll(0, 0)
                            }}
                          >
                            {numberOfMonth === 6 ? 'ĐANG CHỌN' : 'CHỌN MUA'}
                          </button>
                        </td>
                      )}
                      {nineMonth !== 0 && (
                        <td>
                          <button
                            className={`choosing-btn ${
                              numberOfMonth === 9 ? 'active' : ''
                            } `}
                            href="#table-smooth"
                            onClick={() => {
                              this.setState({
                                totalCost: nineMonth,
                                isSelecting: false,
                                numberOfMonth: 9,
                              })
                              // window.scroll(0, 0)
                            }}
                          >
                            {numberOfMonth === 9 ? 'ĐANG CHỌN' : 'CHỌN MUA'}
                          </button>
                        </td>
                      )}
                      {twelveMonth !== 0 && (
                        <td>
                          <button
                            className={`choosing-btn ${
                              numberOfMonth === 12 ? 'active' : ''
                            } `}
                            href="#table-smooth"
                            onClick={() => {
                              this.setState({
                                totalCost: twelveMonth,
                                isSelecting: false,
                                numberOfMonth: 12,
                              })
                              // window.scroll(0, 0)
                            }}
                          >
                            {numberOfMonth === 12 ? 'ĐANG CHỌN' : 'CHỌN MUA'}
                          </button>
                        </td>
                      )}
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          )}
          <div className="note">
            (*) Số tiền thực tế có thể chênh lệch khoảng 10,000đ/tháng <br />
            (*) Trả góp qua công ty tài chính hiện tại chỉ hỗ trợ khách hàng khu
            vực thành phố Hồ Chí Minh. Hotline hỗ trợ{' '}
            <a href="tel:19008922">19008922</a>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { error, isBuying, isSelecting, city, district, ward, orderData } = this.state
    const { productsInstalment, isFetching } = this.props
    if (isFetching) {
      return <Spinner />
    }
    return (
      <div className={'shopping-cart-instalment'}>
        {isEmpty(productsInstalment) ? (
          this.renderProductEmpty()
        ) : (
          <div>
            {/* {!isSelecting && (
              <div
                role="presentation"
                onClick={() => this.setState({ isSelecting: true })}
                className="btn-back"
              >
                <i className="icon ion-ios-arrow-back" />
                <span>Quay lại</span>
              </div>
            )} */}
            <div className="order-modal-container">
              <button className="close-modal-button" onClick={this.hide}>
                X
              </button>
              <div className="order-modal">
                <div className="products-container">{this.renderProduct()}</div>
                {this.renderTabPayment()}
                <div className={!isSelecting ? 'open-form' : 'hide-form'}>
                  <div className="customer-info-container">
                    <form onSubmit={this.placeOrder}>
                      <div className="form-input">
                        <div className="radio-container">
                          <div className="radio">
                            <input
                              id="anh"
                              type="radio"
                              name="payment"
                              checked={
                                this.state.customerData.gender === 'MALE'
                              }
                              onChange={() =>
                                this.onCustomerDataChange({ gender: 'MALE' })
                              }
                            />
                            <label className="radio-label" htmlFor="anh">
                              Anh
                            </label>
                          </div>
                          <div className="radio">
                            <input
                              id="chi"
                              type="radio"
                              name="payment"
                              checked={
                                this.state.customerData.gender === 'FAMALE'
                              }
                              onChange={() =>
                                this.onCustomerDataChange({
                                  gender: 'FAMALE',
                                })
                              }
                            />
                            <label className="radio-label" htmlFor="chi">
                              Chị
                            </label>
                          </div>
                        </div>
                        <div>
                          <input
                            required
                            placeholder="Họ và tên"
                            className={`customer-input ${
                              error.name ? 'error' : ''
                            }`}
                            value={this.state.customerData.name}
                            onChange={(e) => {
                              this.onCustomerDataChange({
                                name: e.target.value,
                              })
                            }}
                          />
                        </div>
                        <div className="row">
                          <input
                            required
                            placeholder="Số điện thoại"
                            className={`customer-input ${
                              error.phone ? 'error' : ''
                            }`}
                            value={this.state.customerData.phone}
                            onChange={(e) => {
                              this.onCustomerDataChange({
                                phone: e.target.value,
                              })
                            }}
                          />
                          <input
                            placeholder="Email (không bắt buộc)"
                            className="customer-input"
                            type="email"
                            value={this.state.customerData.email}
                            onChange={(e) => {
                              this.onCustomerDataChange({
                                email: e.target.value,
                              })
                            }}
                          />
                        </div>
                        <input
                          placeholder="Ghi chú thêm (không bắt buộc)"
                          className="customer-input description"
                          onChange={(e) => {
                            this.onOrderDataChange({ note: e.target.value })
                          }}
                        />
                      </div>
                      {/* <div className="row">
                          <input
                            required
                            placeholder="Số chứng minh nhân dân"
                            className="customer-input"
                            value={this.state.customerData.idNumber}
                            onChange={(e) => {
                              this.onCustomerDataChange({
                                idNumber: e.target.value,
                              })
                            }}
                          />
                          <input
                            data-placeholder="Ngày tháng năm sinh"
                            className="customer-input date-picker"
                            type="date"
                            required
                            aria-required="true"
                            value={get(
                              this.state.customerData,
                              'info.dateOfBirth',
                              ''
                            )}
                            onChange={(e) => {
                              this.onCustomerDataChange({
                                info: { dateOfBirth: e.target.value },
                              })
                            }}
                          />
                        </div> */}
                      <div className="radio-container">
                        <div className="radio">
                          <input
                            id="home"
                            type="radio"
                            name="receive"
                            checked={
                              get(orderData, 'shop_pickup') === false
                            }
                            onChange={() => {
                              this.onOrderDataChange({
                                shop_pickup: false,
                              })
                            }}
                          />
                          <label className="radio-label" htmlFor="home">
                            Nhận hàng tại nhà
                          </label>
                        </div>
                        <div className="radio">
                          <input
                            id="shop"
                            type="radio"
                            name="receive"
                            checked={get(orderData, 'shop_pickup') === true}
                            onChange={() => {
                              this.onOrderDataChange({ shop_pickup: true })
                            }}
                          />
                          <label className="radio-label" htmlFor="shop">
                            Nhận tại cửa hàng
                          </label>
                        </div>
                      </div>
                      {get(orderData, 'shop_pickup') === false && (
                        <div className="form-received">
                          <span>
                            {' '}
                            <strong>
                              Để xét duyệt nhanh hơn, anh/chị vui lòng cung cấp
                              địa chỉ hiện tại
                            </strong>
                          </span>
                          <div className="row-play">
                            <ReactSelect
                              required
                              clearable={false}
                              value={city}
                              className="full-width"
                              placeholder="Tỉnh, thành phố"
                              options={[
                                {
                                  label: 'Tp. Hồ Chí Minh',
                                  id: 'Tp. Hồ Chí Minh',
                                },
                                { label: 'Tỉnh khác', id: 'Tỉnh khác' },
                              ]}
                              labelKey="label"
                              valueKey="id"
                              onChange={(e) => {
                                if (e.id === 'Tỉnh khác') {
                                  this.setState({
                                    city: e.id,
                                    district: '',
                                    ward: '',
                                  })
                                } else {
                                  this.setState({ city: e.id })
                                }
                              }}
                            />
                            <ReactSelect
                              required
                              clearable={false}
                              value={district}
                              className="full-width"
                              placeholder="Quận, huyện"
                              options={locations}
                              labelKey="Title"
                              valueKey="Title"
                              onChange={(e) =>
                                this.setState({ district: e.Title })
                              }
                              disabled={city === 'Tỉnh khác' || city === ''}
                            />
                            <ReactSelect
                              required
                              value={ward}
                              clearable={false}
                              className="full-width"
                              placeholder="Phường, xã"
                              options={
                                district
                                  ? locations
                                      .find((item) => item.Title === district)
                                      .xaPhuong.sort()
                                  : []
                              }
                              labelKey="Title"
                              valueKey="Title"
                              disabled={city === 'Tỉnh khác' || district === ''}
                              onChange={(e) => this.setState({ ward: e.Title })}
                            />
                            <input
                              required
                              placeholder="Địa chỉ, tên đường"
                              // className="customer-input description"
                              className={`customer-input ${
                                error.address ? 'error' : ''
                              }`}
                              onChange={(e) => {
                                this.onOrderDataChange({
                                  address: `${e.target.value}`,
                                })
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {get(orderData, 'shop_pickup') === true && (
                        <div className="form-received">
                          <div className="radio-container">
                            <div className="list-showroom">
                              <div className="radio">
                                <input
                                  id="cn1"
                                  type="checkbox"
                                  name="cn1"
                                  checked={get(orderData, 'shop_pickup') === true && get(orderData, 'warehouse_id') === 1}
                                  onChange={() => {
                                    this.onOrderDataChange({
                                      shop_pickup: true,
                                      warehouse_id: 1,
                                    })
                                  }}
                                />
                                <label
                                  className="radio-label"
                                  htmlFor="cn1"
                                >
                                  Showroom 1: 121 Chu Văn An, P.26, Q. Bình Thạnh, TP. HCM
                                </label>
                              </div>
                              <div className="radio">
                                <input
                                  id="cn2"
                                  type="checkbox"
                                  name="cn2"
                                  checked={get(orderData, 'shop_pickup') === true && get(orderData, 'warehouse_id') === 2}
                                  onChange={() => {
                                    this.onOrderDataChange({
                                      shop_pickup: true,
                                      warehouse_id: 2,
                                    })
                                  }}
                                />
                                <label
                                  className="radio-label"
                                  htmlFor="cn2"
                                >
                                  Showroom 2: 1247 Đường 3 tháng 2, P.6, Q. 11, TP. HCM
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        disabled={isBuying}
                        className="btn-order btn-instalment"
                        type="submit"
                      >
                        ĐĂNG KÝ TRẢ GÓP
                      </button>
                    </form>
                    <div className="noti">
                      Bằng cách đặt hàng, bạn đồng ý với Điều khoản sử dụng của
                      Dienthoaigiakho.vn
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

Cart.propTypes = {
  // productDetailRequest: PropTypes.func,
  products: PropTypes.array,
  detail: PropTypes.object,
  // addProductToCart: PropTypes.func,
  // descreceProductCountOnCart: PropTypes.func,
  removeProductInstalment: PropTypes.func,
  placeOrderRequest: PropTypes.func,
  history: PropTypes.object,
  isFetching: PropTypes.bool,
  productsInstalment: PropTypes.object,
  location: PropTypes.object,
}

const mapStateToProps = (state) => ({
  products: state.cart.get('products') ? state.cart.get('products').toJS() : [],
  productsInstalment: state.cart.get('productsInstalment')
    ? state.cart.get('productsInstalment').toJS()
    : {},
  detail: state.cart.get('detail') ? state.cart.get('detail').toJS() : {},
  isFetching: state.cart.get('isFetching'),
})

const mapDispatchToProps = (dispatch) => ({
  productDetailRequest: (slug) =>
    dispatch(CartActions.cartProductDetailRequest(slug)),

  addProductToCart: (product, option, warranty, isInstalment) =>
    dispatch(
      CartActions.addProductToCart(product, option, warranty, isInstalment)
    ),

  descreceProductCountOnCart: (productId, isInstalment) =>
    dispatch(CartActions.descreceProductCountOnCart(productId, isInstalment)),

  removeProductInstalment: (productId, callback) =>
    dispatch(CartActions.removeProductInstalment(productId, callback)),

  placeOrderRequest: (params, succuss, error) =>
    dispatch(CartActions.placeOrderRequest(params, succuss, error)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Cart)
