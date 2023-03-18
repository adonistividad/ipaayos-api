/****** 
 * import moment from "moment";
import { Op } from "sequelize";
import Billing from "../app/entities/Billing";
import { BaseRepository } from "../app/repositories/Base/BaseReprository";
import config from "../config/config";
import InitDB from "../database/model";
import RolesPermissionsController from "./roles_permissions";
import Permissions from './../app/entities/Permissions';
import { any } from "sequelize/types/lib/operators";
import axios from "axios";

const geoip = require('geoip-lite');
const fs = require('fs');
const pug = require('pug');
const path = require('path');
const pdf = require('html-pdf');
const nodemailer = require("nodemailer");
const countryCurrency = require('iso-country-currency');
const stripe = require('stripe');

import { parse } from 'node-html-parser';
import RedisCaching from "../caching";
import mysql from "../dbConnection/mysql";

let db = mysql.ConnectToDB();

export default class SetupBilling extends BaseRepository<Billing> {
    stripe: any = null;
    
    ARAB_COUNTRIES = [
      "Algeria", 
      "Bahrain", 
      "Comoros", 
      "Djibouti", 
      "Egypt", 
      "Iraq", 
      "Jordan", 
      "Kuwait", 
      "Lebanon", 
      "Libya", 
      "Mauritania", 
      "Morocco", 
      "Oman", 
      "Palestine", 
      "Qatar", 
      "Saudi Arabia", 
      "Somalia", 
      "Sudan", 
      "Syria", 
      "Tunisia", 
      "United Arab Emirates", 
      "Yemen"
    ];

    CreateCheckoutSession = async (req: any, res: any) => {
      try {
        let {
          sessionArr
        } = req.body
        console.log(req.body.sessionArr);
        console.log(sessionArr.length);
        let nSessionArr = JSON.parse(sessionArr);

        console.log(nSessionArr.length);
        console.log(nSessionArr);
        console.log(typeof nSessionArr);
        if(nSessionArr.length > 0) {
          
          this._db = req.db;

          let session_id = `USER-SESSION-${Math.ceil(Math.random() * 10000000000)}-TS${Date.now()}`;
          let ip = req.body.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
          let locObj = geoip.lookup(ip);

          let sessionCartArr: any = [];

          for(const el of nSessionArr) {
            console.log(el);
            sessionCartArr.push({
              session_id,
              session_serial: el.serial,
              session_qty: el.qty,
              session_item_name: el.name,
              session_item_type: (el.domain_mode !== null || el.domain_mode !== undefined) ? JSON.stringify(el.domain_mode) : null,
              session_item_plan: el.plan,
              session_item_price: el.price,
              session_item_currency: el.currency,
              session_ip: ip,
              session_city: locObj === null ? null : locObj.city,
              session_country: locObj === null ? null : locObj.country,
              session_timezone: locObj === null ? null : locObj.timezone,
              session_device: el.device
            });
          };

          if(sessionCartArr.length > 0) {
            console.log(sessionCartArr.length);
            const checkoutSession: any = await this.bulkcreate(sessionCartArr, 'checkout_session');
            if(checkoutSession) {
              return res.status(200).json({
                status: 200,
                sessionClientID: session_id,
                msg: 'Checkout Session has been initialized succesfully.'
              });
            } else {
              return res.status(200).json({
                status: 500,
                checkoutSession: null,
                sessionClientID: null,
                msg: 'Something went wrong while initailizing your checkout session.'
              });
            }
          } else {
            return res.status(200).json({
              status: 500,
              checkoutSession: null,
              sessionClientID: null,
              msg: 'Something went wrong while initailizing your checkout session.'
            });
          }
        } else {
          res.status(200).json({
            status: 500,
            msg: 'Please add items to your cart in-order to proceed with checkout. Your Cart is empty right now.'
          });
        }
      } catch (err) {
        res.status(200).json({
          status: 500,
          msg: 'Something went wrong while creating your checkout session. Please contact support.' + err
        });
      }
    };

    FetchCheckoutSessionDetails = async (req: any, res: any) => {
      try {
        let {
          sessionClientID
        } = req.body
        
        this._db = req.db;

        let session_id = `USER-SESSION-${Math.ceil(Math.random() * 10000000000)}`;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        let locObj = geoip.lookup(ip);
        const checkoutSession: any = await this.findAllByCondition({
            where: {
              session_id: sessionClientID,
              session_status: 'pending'
            }
        }, 'checkout_session');

        if(checkoutSession.length > 0) {
          return res.status(200).json({
            status: 200,
            msg: 'Checkout Session has been initialized succesfully.',
            checkoutSession: checkoutSession
        });
        } else {
          return res.status(200).json({
            status: 500,
            msg: 'Unable to find any session related to the current user.',
            checkoutSession: null
          });
        }
      } catch (err) {
        res.status(200).json({
          status: 500,
          msg: `Something went wrong while fetching your checkout session. Please contact support. ERR ${err}`
        });
      }
    };

    DestroyCheckoutSession = async (req: any, res: any) => {
      try {
        let {
          session
        } = req.body
        
        this._db = (await req.dbConn).conn["workone_main_db"];

        const checkoutSession: any = await this.delete(session, 'checkout_session');

        if(checkoutSession) {
          return res.status(200).json({
            status: 200,
            checkoutSession: checkoutSession.id,
            msg: 'Checkout Session has been destroyed succesfully.'
        });
        } else {
          return res.status(200).json({
            status: 500,
            checkoutSession: null,
            msg: 'Something went wrong while destroying your checkout session.'
          });
        }
      } catch (err) {
        res.status(200).json({
          status: 500,
          msg: 'Something went wrong while destroying your checkout session. Please contact support.'
        });
      }
    };

    UpdateCheckoutSession = async (req: any, res: any) => {
      try {
        let {
          id,
          serial,
          name,
          plan,
          price,
          qty
        } = req.body

        
        this._db = req.db;

        const checkoutSession: any = await this.updateByCondition({
          where: {
            session_id: id
          }
        }, {
          session_serial: serial,
          session_qty: qty,
          session_item_name: name,
          session_item_plan: plan,
          session_item_price: price,
          session_status: 'paid'
        }, 'checkout_session');

        if(checkoutSession) {
          return res.status(200).json({
            status: 200,
            sessionClientID: id,
            msg: 'Checkout Session has been updated succesfully.'
          });
        } else {
          return res.status(200).json({
            status: 500,
            checkoutSession: null,
            sessionClientID: null,
            msg: 'Something went wrong while initailizing your checkout session.'
          });
        }
      } catch (err) {
        res.status(200).json({
          status: 500,
          msg: 'Something went wrong while updating your checkout session. Please contact support.' + err
        });
      }
    };

    FetchCouponFromStripe = async (req: any, res: any) => {
      try {
        let { coupon } = req.body;
        if(coupon !== '') {
          this.setStripeRegion(req);
          const couponRes = await this.stripe.coupons.retrieve(coupon);

          if(couponRes) {
            res.status(200).json({
              status: 200,
              msg: 'Great! Coupon Applied.',
              name: couponRes.name,
              discount: (couponRes.amount_off / 100),
              currency: couponRes.currency,
              livemode: couponRes.livemode
            });
          } else {
            res.status(200).json({
              status: 200,
              msg: 'Invalid Coupon. Please Provide a Valid Coupon.'
            });
          }
        } else {
          res.status(200).json({
            status: 400,
            msg: 'Please Provide a Valid Coupon.'
          });
        }
      } catch(err) {
        res.status(200).json({
          status: 500,
          msg: 'Something went wrong while validating your coupon. Please contact support.'
        });
      }
    };

    CreateCustomer = async (req: any, res: any) => {
        this._db = req.db;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        // Create a new customer object
        this.setStripeRegion(req);
        const customer = await this.stripe.customers.create({
          email: req.body.email,
          tax: {
            ip_address: ip
          },
        });

        const addCustomerID: any = await this.create({
            customer_id: customer.id,
            email: req.body.email,
            org_id: req.org_id,
            status: 'payment_request_initiated'
        }, 'org_billing_capture');

        if(addCustomerID) {
            // Save the customer.id in your database alongside your user.
            // We're simulating authentication with a cookie.
            res.cookie('customer', customer.id, { maxAge: 900000, httpOnly: true });
        
            res.status(200).json({ customer });
        } else {
            res.status(200).json({
                status: 500,
                msg: 'Something went wrong while saving customer details.'
            });
        }
    };

    CreateProduct = async (req: any, res: any) => {
      this._db = req.db;
      this.setStripeRegion(req);
      // Create a new stripe product object
      const product = await this.stripe.products.create({
        name: req.body.name,
      });

      if(product) {      
          res.status(200).json({ 
            status: 200,
            msg: 'Product registered successfully',
            product 
          });
      } else {
          res.status(200).json({
              status: 500,
              msg: 'Something went wrong while adding your product details.'
          });
      }
    };

    CreatePrice = async (req: any, res: any) => {
      this._db = req.db;
      let {
        amount,
        currency,
        plan,
        product_id
      } = req.body;
      console.log(amount);
      // CONVERT THE PRICE BASED ON TWO REGION MIDDLEAST OR US STRIPE
      let stripePriceObj: any = this.getLocalStripePrice(req);
      amount = Math.ceil(stripePriceObj.price * 100);

      let priceObj: any = {
        unit_amount: amount, // 1 USD equals to 100 Cents and price should be in cents
        currency: stripePriceObj.currency,
        product: product_id,
      };

      if(plan !== 'fixed') {
        priceObj.recurring = { interval: plan }; // day, week, month, year
      }
      this.setStripeRegion(req);
      // Create a new stripe product object
      const price = await this.stripe.prices.create(priceObj);

      if(price) {
        res.status(200).json({ 
          status: 200,
          msg: 'Product pricing added successfully',
          price 
        });
      } else {
          res.status(200).json({
              status: 500,
              msg: 'Something went wrong while adding your price details.'
          });
      }
    };
      
    CreateSubscription = async (req: any, res: any) => {
        // Simulate authenticated user. In practice this will be the
        // Stripe Customer ID related to the authenticated user.
        this._db = req.db;

        const customerId = req.body.customerId;
        const promoCode = req.body.promoCode;
        const trial = req.body.trial;
      
        let paymentMethod;
        if(req.body.paymentMethodId !== null) {
          try {
            this.setStripeRegion(req);
            paymentMethod = await this.stripe.paymentMethods.attach(
              req.body.paymentMethodId, {
                customer: customerId,
              }
            );
          } catch (error: any) {
            return res.status(400).json({ error: { message: error.message } });
          }
        } else {
          paymentMethod = null;
        }
      
        // Create the subscription
        //FETCH THE PRICES KEYS
        let priceItemsArr: any = [];
        
        req.body.pricesArr.forEach(({product_key, price_id, product_qty}: any) => {
          priceItemsArr.push({
            price: product_key !== '' ? config[product_key.toUpperCase()] : price_id,
            quantity: product_qty 
          });
        });

        console.log(priceItemsArr);

        //const priceId = config[req.body.priceLookupKey.toUpperCase()];
      
        try {
            console.log(promoCode);
            console.log(config[promoCode]);
            let subscriptionObj: any = {
                customer: customerId,
                items: priceItemsArr,
                trial_period_days: trial === 'en' ? 30 : 0,
                expand: ['latest_invoice.payment_intent'],
                //promotion_code: promoCode !== null ? config[promoCode] : null,
                coupon: promoCode,
                default_tax_rates: this.getLocalStripePrice(req).sales_tax
            }

            if(req.body.paymentMethodId !== null) {
              subscriptionObj.default_payment_method = paymentMethod.id;
            }
            this.setStripeRegion(req);
            const subscription = await this.stripe.subscriptions.create(subscriptionObj);
            let createSubscription: any = null;
            if(req.body.paymentMethodId !== null) {
              createSubscription = await this.updateByCondition({
                where: { customer_id: customerId }
              }, {
                  subscription_id: subscription.id,
                  object: subscription.object,
                  items: JSON.stringify(subscription.items),
                  created: subscription.created,
                  current_period_end: subscription.current_period_end,
                  current_period_start: subscription.current_period_start,
                  customer_id: customerId,
                  payment_method_id: subscription.default_payment_method,
                  trial_end: subscription.trial_end,
                  trial_start: subscription.trial_start,
                  tax_percent: subscription.tax_percent,
                  quantity: subscription.quantity,
                  subscription_status: subscription.subscription_status,
                  livemode: subscription.livemode,
                  status: 'subscription_updated'
              }, 'org_billing_capture');
            } else {
              createSubscription = await this.create({
                  subscription_id: subscription.id,
                  object: subscription.object,
                  items: JSON.stringify(subscription.items),
                  created: subscription.created,
                  current_period_end: subscription.current_period_end,
                  current_period_start: subscription.current_period_start,
                  customer_id: customerId,
                  payment_method_id: subscription.default_payment_method,
                  trial_end: subscription.trial_end,
                  trial_start: subscription.trial_start,
                  tax_percent: subscription.tax_percent,
                  quantity: subscription.quantity,
                  subscription_status: subscription.subscription_status,
                  livemode: subscription.livemode,
                  status: 'subscription_created',
                  email: req.body.email
              }, 'org_billing_capture');
            }

            if(createSubscription) {
                res.status(200).json({ subscription });
            }  else {
                res.status(200).json({
                    status: 500,
                    msg: 'Subscrition Created Successfully But Failed to Save Details.'
                })
            }  
        } catch (error: any) {
          return res.status(400).json({ error: { message: error.message } });
        }
    };
      
    InvoicePreview = async (req: any, res: any) => {
        const customerId = req.cookies['customer'];
        const priceId = process.env[req.query.newPriceLookupKey.toUpperCase()];
        this.setStripeRegion(req);
        const subscription = await this.stripe.subscriptions.retrieve(
          req.query.subscriptionId
        );
          
        const invoice = await this.stripe.invoices.retrieveUpcoming({
          customer: customerId,
          subscription: req.query.subscriptionId,
          subscription_items: [ {
            id: subscription.items.data[0].id,
            price: priceId,
          }],
        });
      
        res.status(200).json({ invoice });
    };
      
    CancelSubscription = async (req: any, res: any) => {
        // Cancel the subscription
        try {
          this.setStripeRegion(req);
          const deletedSubscription = await this.stripe.subscriptions.del(
            req.body.subscriptionId
          );
      
          res.status(200).json({ subscription: deletedSubscription });
        } catch (error: any) {
          return res.status(500).json({ error: { message: error.message } });
        }
    };
      
    UpdateSubscription = async (req: any, res: any) => {
        try {
          this.setStripeRegion(req);
          const subscription = await this.stripe.subscriptions.retrieve(
            req.body.subscriptionId
          );
          const updatedSubscription = await this.stripe.subscriptions.update(
            req.body.subscriptionId, {
              items: [{
                id: subscription.items.data[0].id,
                price: process.env[req.body.newPriceLookupKey],
              }],
            }
          );
      
          res.status(200).json({ subscription: updatedSubscription });
        } catch (error: any) {
          return res.status(500).json({ error: { message: error.message } });
        }
    };
      
    ViewSubscriptions = async (req: any, res: any) => {
        // Simulate authenticated user. In practice this will be the
        // Stripe Customer ID related to the authenticated user.
        const customerId = req.cookies['customer'];
        this.setStripeRegion(req);
        const subscriptions = await this.stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          expand: ['data.default_payment_method'],
        });
      
        res.status(200).json({subscriptions});
    };

    CreatePaymentMethod = async (req: any, res: any) => {
      try {
        let { custID, paymentMethod, email, orgName, billing_id } = req.body;

        if(custID !== '' && paymentMethod) {
          this.setStripeRegion(req);
          // ATTACH THE PAYMENT METHOD TO THE CUSTOMER BASED ON ID
          const attchPaymentMethodToCustomer = await this.stripe.paymentMethods.attach(
            paymentMethod.id,
            { customer: custID }
          );
          if(attchPaymentMethodToCustomer) {
            this._db = (await req.dbConn).conn[orgName];
            let billingObj : any = req.body.billingObj;
            billingObj.stripe_id = custID;
            billingObj.stripe_payment_method_id = paymentMethod.id;
            billingObj.email = email;
            
            // CHECK IF THE BILLING DETAILS AVAILABLE
            const fetchBillingDetails = await this.findAll('org_billing_details');
            // if(fetchBillingDetails.length === 0) {
            billingObj.status = 'card_added'
            if(billingObj.primary_card) {
              await this.updateByCondition({
                where: { email }
              }, { primary_card: false }, 'org_billing_details');
            }
            const createBillingDetails = await this.create(billingObj, 'org_billing_details');

            if(createBillingDetails) {
              res.status(200).json({ 
                status: 200,
                msg: 'Your new card has been added successfully.',
                paymentMethod,
                customer: attchPaymentMethodToCustomer
              });
            } else {
              res.status(200).json({ 
                status: 500,
                msg: 'Payment Methods Created Successfully. But Failed to Failed to Create Details.',
                paymentMethod,
                customer: null
              });
            }
            // } else {
            //   billingObj.status = 'card_updated';

            //   const updateBillingDetails = await this.updateByCondition({
            //     where: {id: billing_id}
            //   }, billingObj, 'org_billing_details');

            //   if(updateBillingDetails) {
            //     res.status(200).json({ 
            //       status: 200,
            //       msg: 'Your new card has been added successfully.',
            //       paymentMethod,
            //       customer: attchPaymentMethodToCustomer
            //     });
            //   } else {
            //     res.status(200).json({ 
            //       status: 500,
            //       msg: 'Payment Methods Created Successfully. But Failed to Failed to Update Details.',
            //       paymentMethod,
            //       customer: null
            //     });
            //   }
            // }
          } else {
            res.status(200).json({ 
              status: 500,
              msg: 'Payment Methods Created Successfully. But Failed to Attach to the provided customer.',
              paymentMethod,
              customer: null
            });
          }
        } else {
          res.status(200).json({ 
            status: 500,
            msg: 'Please provide valid customer & card details for the card to be listed.'
          });
        }
      } catch(err) {
        res.status(500).json({
          status: 500,
          msg: `Oops! Something went wrong while adding your payment details. ERR: ${err}`
        })
      }
    };

    DeletePaymentMethod = async (req: any, res: any) => {
      try {
        let { payment_id, orgName } = req.body;
        this._db = (await req.dbConn).conn[orgName];
        if(payment_id !== '') {
          // CHECK HOW MANY PRIMARY CARDS LEFT BEFORE REMOVING
          const fetchBillingDetails: any = await this.findAllByCondition({
            where: { stripe_payment_method_id: payment_id, primary_card: true }
          }, 'org_billing_details');
          console.log('>>>>>>>', fetchBillingDetails)
          if(fetchBillingDetails.length === 0) {
            this.setStripeRegion(req);
            const paymentMethods = await this.stripe.paymentMethods.detach(
              payment_id
            );
            if(paymentMethods) {
              const removeCardDetails: any = await this.deleteByCondition({
                where: { stripe_payment_method_id: payment_id }
              },'org_billing_details');
              if(removeCardDetails) {
                res.status(200).json({ 
                  status: 200,
                  msg: 'Card Details Deleted Successfully.',
                  paymentMethods
                });
              } else {
                res.status(200).json({ 
                  status: 200,
                  msg: 'Card Details has been partially deleted contact support for full deletion.',
                  paymentMethods
                });
              }
            } else {
              res.status(200).json({ 
                status: 500,
                msg: 'Unable to delete the card, sorry no Card Details found related to this customer.',
                paymentMethods
              });
            }
          } else {
            res.status(200).json({ 
              status: 500,
              msg: 'You cannot delete your primary card. Atleast one primary card details are required for service continuation.'
            });
          }
        } else {
          res.status(200).json({ 
            status: 500,
            msg: 'Please provide valid customer details for the card to be removed.'
          });
        }
      } catch(err) {
        res.status(500).json({
          status: 500,
          msg: `Oops! Something went wrong while removing your payment details. ERR: ${err}`
        })
      }
    }

    SetPrimaryPaymentMethod = async (req: any, res: any) => {
      try {
        let { payment_id, email, orgName } = req.body;
        this._db = (await req.dbConn).conn[orgName];
        if(payment_id !== '') {
          // CHECK HOW MANY PRIMARY CARDS LEFT BEFORE REMOVING
          const fetchBillingDetails: any = await this.findAllByCondition({
            where: { stripe_payment_method_id: payment_id }
          }, 'org_billing_details');
          console.log('>>>>>>>', fetchBillingDetails)
          if(fetchBillingDetails.length > 0) {
            const updateAllCardDetails: any = await this.updateByCondition({
              where: { email }
            }, { primary_card: false }, 'org_billing_details');

            const updateCardDetails: any = await this.updateByCondition({
              where: { stripe_payment_method_id: payment_id }
            }, { primary_card: true }, 'org_billing_details');

            if(updateAllCardDetails && updateCardDetails) {
              res.status(200).json({ 
                status: 200,
                msg: 'Card Marked As Primary.',
              });
            } else {
              res.status(200).json({ 
                status: 200,
                msg: 'Unable to mark the card as primary.',
              });
            }
          } else {
            res.status(200).json({ 
              status: 500,
              msg: 'No related cards found in order to make it primary.'
            });
          }
        } else {
          res.status(200).json({ 
            status: 500,
            msg: 'Please provide valid customer details for the card to be removed.'
          });
        }
      } catch(err) {
        res.status(500).json({
          status: 500,
          msg: `Oops! Something went wrong while removing your payment details. ERR: ${err}`
        })
      }
    }

    FetchPaymentMethods = async (req: any, res: any) => {
      try {
        let { custID } = req.body;

        if(custID !== '') {
          this.setStripeRegion(req);
          const paymentMethods = await this.stripe.paymentMethods.list({
            customer: custID,
            type: 'card',
          });
          if(paymentMethods) {
            res.status(200).json({ 
              status: 200,
              msg: 'Payment Methods Fetched Successfully.',
              paymentMethods
            });
          } else {
            res.status(200).json({ 
              status: 500,
              msg: 'Sorry no payment methods found related to this customer.',
              paymentMethods
            });
          }
        } else {
          res.status(200).json({ 
            status: 500,
            msg: 'Please provide valid customer details for the card to be listed.'
          });
        }
      } catch(err) {
        res.status(500).json({
          status: 500,
          msg: 'Oops! Something went wrong while fetching your payment details.'
        })
      }
    };

    FetchBillingDetails = async (req: any, res: any) => {
      try {
        let {
          pkgName,
          email,
          orgName
        } = req.body;

        this._db = req.db;
        const fetchDetails = await this.findAllByCondition({
          where: {
            package_name: {
              [Op.like]: `%${pkgName.toUpperCase()}%`
            },
            //add email here in case for use of superAdmin & roles
          }
        }, 'org_billing');
        let billingsArr: any = [];
        if(fetchDetails.length > 0) {
          fetchDetails.forEach(async (el: any, index: number) => {
            const fetchInvoiceDetails = await this.findAllByCondition({
                where: {
                  package_id: el.id
                }
            }, 'org_invoices');

            if(fetchInvoiceDetails) {
              billingsArr.push({
                billing: el,
                invoice: fetchInvoiceDetails
              });

              if(index === (fetchDetails.length - 1)) {
                if(billingsArr.length > 0) {
                  res.status(200).json({
                    status: 200,
                    msg: 'Got billing details Successfully',
                    billingsArr
                  });
                } else {
                  res.status(200).json({
                    status: 500,
                    msg: 'Something went wrong while getting billing details',
                    billingsArr
                  });
                }
              }
            }
          });
        } else {
          res.status(200).json({
            status: 500,
            msg: 'Something went wrong while getting billing details',
            billingsArr: []
          });
        }
      } catch(err) {
        return res.status(200).json({ status: 500, msg: `Something went wrong while processing your request. ERR: ${err}`  })
      }
    };

    ListAllCustomerInvoices = async (req: any, res: any) => {
      try {
        let { cust_id, subs_id } = req.body;
        this.setStripeRegion(req);
        const invoices = await this.stripe.invoices.list({
          customer: cust_id,
          subscription: subs_id
          //limit: 3,
        });

        if(invoices) {
          res.status(200).json({invoices: {
            status: 200,
            msg: "Successfully found invoices related to the current customer ID.",
            invoices: invoices.data
          }});
        } else {
          res.status(200).json({invoices: {
            status: 500,
            msg: "No invoices found related to the current customer ID.",
            invoices: []
          }});
        }
      } catch (error: any) {
        return res.status(200).json({ invoices: { status: 500, msg: error.message } });
      }
    };

    ReteriveUpcomingInvoices = async (req: any, res: any) => {
      try {
        let { cust_id, subs_id } = req.body;
        this.setStripeRegion(req);
        const invoices = await this.stripe.invoices.listUpcomingLineItems({
          customer: cust_id,
          subscription: subs_id
          //limit: 3,
        });

        if(invoices) {
          res.status(200).json({upcoming: {
            status: 200,
            msg: "Successfully found invoices related to the current customer.",
            invoices: invoices.data
          }});
        } else {
          res.status(200).json({upcoming:{
            status: 500,
            msg: "No invoices found related to the current customer.",
            invoices: []
          }});
        }
      } catch (error: any) {
        return res.status(200).json({ upcoming: { status: 500, msg: error.message } });
      }
    };

    PayInvoiceNow = async (req: any, res: any) => {
      try {
        let { inv_id } = req.body;
        this.setStripeRegion(req);
        const invoice = await this.stripe.invoices.pay(inv_id);

        if(invoice) {
          res.status(200).json({paid:{
            status: 200,
            msg: "Successfully Paid Invoice.",
            invoice: invoice
          }});
        } else {
          res.status(200).json({paid:{
            status: 500,
            msg: "Unable to make payment for the invoice.",
            invoice: {}
          }});
        }
      } catch (error: any) {
        return res.status(200).json({ paid: { status: 500, msg: error.message } });
      }
    };

    SendInvoiceForManualPayment = async (req: any, res: any) => {
      try {
        let { inv_id } = req.body;
        this.setStripeRegion(req);
        const invoice = await this.stripe.invoices.sendInvoice(inv_id);

        if(invoice) {
          res.status(200).json({manual_invoice: {
            status: 200,
            msg: "Successfully sent invoice for payment.",
            invoice: invoice
          }});
        } else {
          res.status(200).json({manual_invoice: {
            status: 500,
            msg: "Unable to send invoice for payment.",
            invoice: {}
          }});
        }
      } catch (error: any) {
        return res.status(200).json({ manual_invoice: { status: 500, msg: error.message } });
      }
    };

    ProcessPostCheckout = async (req: any, res: any) => {
      try {
        let {
          email,
        } = req.body;

        req.setTimeout(0);

        console.log('I am here NOW ++++')
        config.mysql.databaseName = 'workone_main_db';
        this._db = (await req.dbConn).conn["workone_main_db"];

        // MIGRATE THIS USER TO THE ITS ORG DB AS AN ORG MEMBER FOR FURTHER LOGIN
        const user: any = await this.findOne({
          where: { email }
        }, 'users');
        
        let billingCapture: any = [];
        let invoices: any = [];
        let createOrgBillingCapture: any = null;
        let createOrgInvoices: any = null;
        
        if(req.body.billing) {
           // MIGRATE THE USER BILLING TO ITS ORG DB
          billingCapture = await this.findAllByCondition({
            where: { email }
          }, 'org_billing_capture');
        } 
       
        if(req.body.invoices) {
          // MIGRATE THE USER INVOICE TO THE ORG DB
          invoices = await this.findAllByCondition({
            where: { email }
          }, 'org_invoices');
        }

        if(user) {
          //config.mysql.databaseName = req.org_name;
          this._db = (await req.dbConn).conn[req.org_name];
          const findOrgMember = await this.findAllByCondition({
            where: { email }
          }, 'org_members');

          let createUserAsOrgMember = null;

          if(findOrgMember.length === 0) {
            createUserAsOrgMember = await this.create({
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              password: user.password,
              permission_id: null,
              org_id: null,
              session: null,
              team_status: 'PRIMARY_ADMIN',
              status: req.body.billing && req.body.invoices ? 'pending_domain_config' : 'new_user_no_products'
            }, 'org_members');
          } else {
            createUserAsOrgMember = await this.updateByCondition({
              where: { email }
            }, {
              status: req.body.billing && req.body.invoices ? 'pending_domain_config' : 'config_problems'
            }, 'org_members');
          }
          

          if(createUserAsOrgMember !== null && createUserAsOrgMember !== undefined) {
            if(billingCapture.length > 0 && invoices.length > 0) {
              let {
                subscription_id,
                object,
                items,
                created,
                current_period_end,
                current_period_start,
                customer_id,
                trial_end,
                trial_start,
                tax_percent,
                quantity,
                subscription_status,
                livemode,
                status,
                email,
                org_id,
              } = billingCapture.reverse()[0];
  
              createOrgBillingCapture = await this.create({
                subscription_id,
                object,
                items,
                created,
                current_period_end,
                current_period_start,
                customer_id,
                trial_end,
                trial_start,
                tax_percent,
                quantity,
                subscription_status,
                livemode,
                status,
                email,
                org_id,
              }, 'org_billing_capture');
  
              if(createOrgBillingCapture) {
                let {
                  serial,
                  invoice_date,
                  due_date,
                  total,
                  package_id,
                  status,
                  org_id,
                  email,
                } = invoices.reverse()[0];
  
                createOrgInvoices = await this.create({
                  serial,
                  invoice_date,
                  due_date,
                  total,
                  package_id,
                  status,
                  org_id,
                  email,
                }, 'org_invoices');
              }
            }

            // SETTING UP ROLES & PERMISSION FOR MAIN PRIMARY ADMIN
            let prmReqObj: any = {};
            prmReqObj.email = req.body.email;
            prmReqObj.role = "primary_admin";
            prmReqObj.permissions = "GRANTED_ALL";
            prmReqObj.status = "approved";
            prmReqObj.db = req.db;
            
            let rolesPermissions = new RolesPermissionsController();
            let createUserPermissions: any = await rolesPermissions.CreatePermissions(prmReqObj, res);

            if(createUserPermissions) {
              const updateOrgMemberPerms = await this.updateByCondition({
                where: { email: req.body.email }
              },{ permission_id: createUserPermissions.id }, 'org_members');

              if(updateOrgMemberPerms) {
                // AFTER SETTING UP ROLES & PERMISSION FOR MAIN PRIMARY ADMIN
                // UPDATE ITS ID IN THE DB TO CREATE A LINK
                
                return res.status(200).json({
                  status: 200,
                  msg: "Sucessfully initiated your configuration process."
                });
              } else {
                return res.status(200).json({ 
                  status: 500,
                  msg: "Oops! Something went wrong while your updating your permissions and role access."
                });
              }
            } else {
              return res.status(200).json({ 
                status: 500,
                msg: "Oops! Something went wrong while your configurating your permissions and role."
              });
            }

          } else {
            return res.status(200).json({ 
              status: 500,
              msg: "Oops! Something went wrong while initiating your configuration process."
            });
          }
        } else {
          return res.status(200).json({ status: 500, 
            msg: 'Oops! Something went wrong while configuring all post process setting.',
            user,
            billingCapture,
            invoices
          });
        }
      } catch(error: any) {
        return res.status(200).json({ status: 500, msg: error.message});
      }
    };

    EmailInvoiceToUser = async (req: any, res: any) => {
      try {
        let { 
          products,
          invoice_date,
          invoice_due_date,
          invoice_no,
          customer_name,
          email,
          subtotal,
          tax,
          promo,
          discount,
          grand_total,
          invoiceLocales
        } = req.body;

        let templateVariables: any = {
          products,
          invoice_date,
          invoice_due_date,
          invoice_no,
          customer_name,
          subtotal,
          tax,
          promo,
          discount,
          grand_total,
          invoiceLocales
        }

        this._db = req.db;
        const createInvoice = await this.create({
          serial: invoice_no,
          invoice_date,
          due_date: invoice_due_date,
          total: grand_total,
          package_id: null,
          status: 'paid',
          org_id: null,
          email
        }, 'org_invoices');

        if(createInvoice) {
          let pdfFile = './invoices/invoice_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '.pdf';
          let filepath = path.resolve(__dirname, '../templates/invoices/invoice.pug');
          console.log('>>>>>PDF PATH',`file://${path.join(__dirname, '../templates/invoices/')}`);
          fs.readFile(filepath, 'utf8', function (err: any, data: any) {
            if (err) throw err;
            let fn = pug.compile(data);
            let html = fn(templateVariables);
            let options = {
              pageSize: 'Letter',
              marginTop: '0.5in',
              marginLeft: '0.25in',
              marginRight: '0.25in',
              marginBottom: '0.5in',
              phantomPath: config.PHANTOM_JS_PATH,
              paginationOffset: 1,
              base: `file://${path.join(__dirname, '../templates/invoices/')}`,
              header: {
                "height": "35mm",
                "contents": `<a href="https://workone.cloud/" style="display:block;margin-top:13px;margin-bottom:13px;margin-left:24px;" target="_blank">
                  <img src="file://${path.join(__dirname, '../templates/invoices/images/workone-logo.png')}" alt="WorkOne" title="WorkOne" width="50" height="35" style="max-width: 50px !important" /></a>`
              },
              footer: {
                "height": "37mm",
                "contents": {
                  default: `
                  <div style="color: #575758; line-height: 170%; text-align: center; word-wrap: break-word;">
                    <span style="font-size: 14px; margin-top: 14px; line-height: 170%; font-family: Arial, Helvetica, sans-serif;">{{page}}</span>/<span style="font-size: 14px; line-height: 170%; font-family: Arial, Helvetica, sans-serif;">{{pages}}</span>
                  </div>
                  `,
                  last: `
                    <div style="color: #575758; line-height: 170%; text-align: center; word-wrap: break-word;">
                        <div style="font-size: 14px; line-height: 170%; font-family: Arial, Helvetica, sans-serif;">Thank you for purchasing with us!</div>
                        <p style="font-size: 14px; line-height: 170%; font-family: Arial, Helvetica, sans-serif;">© COPYRIGHT 2022 ALL RIGHTS RESERVED.</p>
                        <span style="font-size: 14px; line-height: 170%; font-family: Arial, Helvetica, sans-serif;">{{page}}</span>/<span style="font-size: 14px; line-height: 170%; font-family: Arial, Helvetica, sans-serif;">{{pages}}</span>
                    </div>`
                }
              }
            };

            if (html) {
              pdf.create(html, options).toFile(pdfFile, function (err: any, resp: any) {
                if (err) return res.send(err);
                console.log(resp);

                var fs = require('fs'),
                pdf_data = fs.readFileSync(resp.filename);

                console.log(pdf_data.toString('base64'));

                fs.readFile(path.join(__dirname, '../templates/emails/billingInvoiceEmail.pug'),
                  'utf8',
                  async (err: any, data: any) => {
                    if (err) throw err;

                    let fn = pug.compile(data);
                    templateVariables.invoice_url = `https://api.workone.cloud:4545/${pdfFile}`
                    let emailTemp = fn(templateVariables);
                    let transporter = nodemailer.createTransport(config.mail);
                    // send mail with defined transport object
                    let info = await transporter.sendMail({
                        from: '"Billing Workone" <billing@workone.cloud>', // sender address
                        to: email, // list of receivers
                        cc: ['marco@meekd.com','muhannad@workone.cloud','ahmed@meekd.work'],
                        subject: "Workone Invoice for Purchased Services", // Subject line
                        text: "Please find your attached invoice for services you have purchased from Workone, Inc. DE, USA. Welcome to our family and thanks for choosing us.", // plain text body
                        html: emailTemp, // html body
                        attachments: [
                          {
                            //headers: "Content-Type: application/pdf",
                            //content: pdf_data.toString('base64'),
                            contentType: "application/pdf",
                            path: pdfFile,
                            //encoding: 'base64',
                            name: "Workone Invoice",
                            filename: "workone_invoice.pdf",
                            contentDisposition: "attachment",
                            cid: "1001"
                          }
                        ]
                    });

                    if(info) {
                      res.status(200).json({
                        status: 200,
                        msg: "Successfully sent paid invoice.",
                      });
                    } else {
                      res.status(200).json({
                        status: 500,
                        msg: "Unable to send invoice."
                      });
                    }
                  });
              });
            }
          });
        } else {
          return res.status(200).json({ status: 500, msg: "Oops! We are unable to save your invoice details. Please try again." });
        }
      } catch (error: any) {
        return res.status(200).json({ status: 500, msg: error.message });
      }
    }

    FetchBillingCapture = async (req: any, res: any) => {
      try {
        this._db = req.db;
        const subscription = await this.findAll('org_billing_capture');

        if(subscription && subscription.length > 0) {
          return res.status(200).json({ 
            status: 200,
            msg: "Subscription Details Found.",
            subscription: subscription.reverse()
          });
        } else {
          return res.status(200).json({ 
            status: 500,
            msg: "Oops! No Subscription Details Found."
          });
        }
      } catch(error: any) {
        return res.status(200).json({ status: 500, msg: error.message});
      }
    };

    ConvertPriceToLocalCurrency = async (req: any, res: any) => {
      try {
        //this._db = req.db;
        let { price, base_currency } = req.body;
        let ip = req.body.ip;
        let locObj = geoip.lookup(ip);

        let city = locObj === null ? null : locObj.city;
        let country = locObj === null ? null : locObj.country;
        let timezone = locObj === null ? null : locObj.timezone;
        console.log(ip);

        let currencyCountryISO = [{
          currency: 'argentine peso',
          country: 'Argentina'
        },
        {
          currency: 'australian dollar',
          country: 'Australia'
        },
        { currency: 'bahraini dinar', country: 'Bahrain' },
        {
          currency: 'botswana pula',
          country: 'Botswana'
        },
        {
          currency: 'brazilian real',
          country: 'Brazil'
        },
        {
          currency: 'bruneian dollar',
          country: 'Sultanate of Brunei'
        },
        {
          currency: 'bulgarian lev',
          country: 'Bulgaria'
        },
        {
          currency: 'canadian dollar',
          country: 'Canada'
        },
        {
          currency: 'chilean peso',
          country: 'Chile'
        },
        {
          currency: 'chinese yuan renminbi',
          country: 'China'
        },
        {
          currency: 'colombian peso',
          country: 'Colombia'
        },
        {
          currency: 'croatian kuna',
          country: 'Croatia'
        },
        {
          currency: 'czech koruna',
          country: 'Czech Republic'
        },
        { currency: 'danish krone', country: 'Denmark' },
        { currency: 'danish krone', country: 'Greenland' },
        { currency: 'danish krone', country: 'Faroe Islands' },
        { currency: 'euro', country: 'Europe' },
        {
          currency: 'hong kong dollar',
          country: 'Hong Kong'
        },
        {
          currency: 'hungarian forint',
          country: 'Hungry'
        },
        {
          currency: 'icelandic krona',
          country: 'Iceland'
        },
        {
          currency: 'indian rupee',
          country: 'India'
        },
        {
          currency: 'indonesian rupiah',
          country: 'Indonesia'
        },
        {
          currency: 'iranian rial',
          country: 'Iran'
        },
        {
          currency: 'israeli shekel',
          country: 'Israel'
        },
        {
          currency: 'japanese yen',
          country: 'Japan'
        },
        {
          currency: 'kazakhstani tenge',
          country: 'Kazakhstan'
        },
        {
          currency: 'south korean won',
          country: 'South Korea'
        },
        {
          currency: 'kuwaiti dinar',
          country: 'Kuwait'
        },
        { currency: 'libyan dinar', country: 'Libya' },
        {
          currency: 'malaysian ringgit',
          country: 'Malaysia'
        },
        {
          currency: 'mauritian rupee',
          country: 'Mauritius'
        },
        { currency: 'mexican peso', country: 'Mexico' },
        {
          currency: 'nepalese rupee',
          country: 'Nepal'
        },
        {
          currency: 'new zealand dollar',
          country: 'New Zealand'
        },
        {
          currency: 'norwegian krone',
          country: 'Norway'
        },
        { currency: 'omani rial', country: 'Oman' },
        {
          currency: 'pakistani rupee',
          country: 'Pakistan'
        },
        {
          currency: 'philippine peso',
          country: 'Philippines'
        },
        { currency: 'polish zloty', country: 'Poland' },
        { currency: 'qatari riyal', country: 'Qatar' },
        {
          currency: 'romanian new leu',
          country: 'Romania'
        },
        {
          currency: 'russian ruble',
          country: 'Russia'
        },
        {
          currency: 'saudi arabian riyal',
          country: 'Saudi Arabia'
        },
        {
          currency: 'singapore dollar',
          country: 'Singapore'
        },
        {
          currency: 'south african rand',
          country: 'South Africa'
        },
        {
          currency: 'south african rand',
          country: 'Namibia'
        },
        {
          currency: 'south african rand',
          country: 'Lesotho'
        },
        {
          currency: 'south african rand',
          country: 'Eswatini'
        },
        {
          currency: 'sri lankan rupee',
          country: 'Sri Lanka'
        },
        {
          currency: 'swedish krona',
          country: 'Sweden'
        },
        { currency: 'swiss franc', country: 'Switzerland' },
        { currency: 'swiss franc', country: 'Liechtenstein' },
        {
          currency: 'taiwan new dollar',
          country: 'Taiwan'
        },
        { currency: 'thai baht', country: 'Thailand' },
        {
          currency: 'trinidadian dollar',
          country: 'Trinidad and Tobago'
        },
        {
          currency: 'turkish lira',
          country: 'Turkey'
        },
        { currency: 'emirati dirham', country: 'United Arab Emirates' },
        {
          currency: 'british pound',
          country: 'United Kingdom'
        },
        {
          currency: 'venezuelan bolivar',
          country: 'Venezuela'
        }];
          

        if(ip !== '' && ip !== null) {
          if(locObj !== null) {
            console.log(locObj);
            let localCurrencyObj = countryCurrency.getAllInfoByISO(country);
            console.log(localCurrencyObj);
            
            let localCurrencySymbol = localCurrencyObj.symbol;
            let localCurrency = localCurrencyObj.currency;
            let localCurrencyPred = localCurrencyObj.currency;
            country = localCurrencyObj.countryName;

            for(let i = 0; i < currencyCountryISO.length; i++) {
              let curr: any = currencyCountryISO[i];
              if(country.toLowerCase().includes(curr.country.toLowerCase())) {
                localCurrencyPred = curr.currency.toLowerCase();
                break;
              } else if(localCurrency.toLowerCase().includes('eur')) {
                localCurrencyPred = 'euro';
                break;
              }
            }

            let ARAB_COUNTRY = false;
            for(let j = 0; j < this.ARAB_COUNTRIES.length; j++) {
              if(country.toLowerCase().includes(this.ARAB_COUNTRIES[j].toLowerCase())) {
                ARAB_COUNTRY = true;
                break;
              }
            }
            
            this.FetchCurrentyExchangeRates(req, null).then((currencyObj: any) => {
              console.log(currencyObj);
              if(currencyObj.currenciesArr.length > 0) {
                let curr = currencyObj.currenciesArr;
                let priceObj: any = {};
  
                for(let {currency, rate, inverseRate} of curr) {
                  if(currency.toLowerCase().includes(localCurrencyPred.toLowerCase())) {
                    priceObj.price = price;
                    priceObj.base_currency = base_currency;
                    if(ARAB_COUNTRY) {
                      priceObj.conversion = (price * parseFloat(rate)) + ((price * parseFloat(rate)) * 2.9 / 100) + 1;
                      priceObj.middle_east_conversion = true;
                      if(country.toLowerCase().includes('yemen') || 
                        country.toLowerCase().includes('somalia') ||
                        country.toLowerCase().includes('libya')) {
                          priceObj.sanctioned = true;
                        } else {
                          priceObj.sanctioned = false;
                        }
                    }
                    else {
                      priceObj.conversion = price * parseFloat(rate);
                      priceObj.middle_east_conversion = false;
                      if(country.toLowerCase().includes('afghanistan') || 
                        country.toLowerCase().includes('balkans') ||
                        country.toLowerCase().includes('belarus') ||
                        country.toLowerCase().includes('burma') ||
                        country.toLowerCase().includes('cuba') ||
                        country.toLowerCase().includes('liberia') ||
                        country.toLowerCase().includes('north korea')) {
                          priceObj.sanctioned = true;
                      } else {
                        priceObj.sanctioned = false;
                      }
                    }
                    priceObj.exchange_rate = parseFloat(rate);
                    priceObj.local_currency_symbol = localCurrencySymbol;
                    priceObj.user_city = city;
                    priceObj.user_country = country;
                    priceObj.user_timezone = timezone;
                  } else if(localCurrency.toLowerCase() === 'usd') {
                    priceObj.price = price;
                    priceObj.base_currency = base_currency;
                    priceObj.middle_east_conversion = false;
                    priceObj.conversion = price * 1;
                    priceObj.exchange_rate = 1.00;
                    priceObj.local_currency_symbol = '$';
                    priceObj.user_city = city;
                    priceObj.user_country = country;
                    priceObj.user_timezone = timezone;
                  }
                }

                console.log(localCurrencyPred);
                res.status(200).json({ 
                  status: 200,
                  msg: "Successfully Coverted the Price.",
                  price: priceObj
                });
              } else {
                res.status(200).json({ 
                  status: 500,
                  msg: "Oops! Unable to perform currency conversion from the specifed exchange.",
                  price: null
                });
              }
            }).catch((err: any) => {
              return res.status(200).json(err);
            });
          } else {
            return res.status(200).json({ 
              status: 404,
              msg: "Oops! Unable to determine the user location."
            });
          }
        } else {
          return res.status(200).json({ 
            status: 404,
            msg: "Oops! Unable to determine the user provided IP address."
          });
        }
      } catch(error: any) {
        return res.status(200).json({ status: 500, msg: error.message});
      }
    };

    FetchCurrentyExchangeRates = (req: any, res: any) => {
      return new Promise((resolve: any, reject: any) => {
        try {
          this._db = req.db;
          let currenciesArr: any = [];
          let exchange_provider = `${config.EXCHANGE_PROVIDER}?from=USD&amount=1`;

          // INIT RADIS CONNECTION
          let redisCache = new RedisCaching();
          redisCache.Connection().then((redis: any) => {
            if(redis.connected) {
              redis.client.get('currencies', async (err: any, data: any) => {
                if(err) {
                  console.log(err);
                  reject(err)
                };
    
                if(data) {
                  data = JSON.parse(data);
                  data.cached = true;
    
                  resolve(data);
                } else {
                  const currencyRates: any = await axios.get(exchange_provider);
                  console.log('>>>>>', currencyRates.data)
                  if(currencyRates.data && currencyRates.data !== '') {
                    console.log('>>>');
                    const root: any = parse(currencyRates.data);
                    
                    //console.log('>>>', root);
                    let elms: any = root.querySelectorAll('.tablesorter.ratesTable tbody tr');
    
                    for(let i = 0; i < elms.length; i++) {
                      let item: any = elms[i].childNodes;
                      let currObj: any = {};
                      console.log('>>>', item.length);
                      for(let j = 0; j < item.length; j++) {
                        let tds = item[j];
                        console.log('>>>>', tds.innerText);
                        if(tds.innerText !== '') {
                          if(j === 1) {
                            currObj.currency = tds.innerText.toLowerCase();
                          }
    
                          if(j === 3) {
                            currObj.rate = parseFloat(tds.innerText);
                          }
    
                          if(j === 5) {
                            currObj.inverseRate = parseFloat(tds.innerText);
                            break;
                          }
                        }
                      }
                      currenciesArr.push(currObj);
                    }
                    let returnObj: any = { 
                      status: 200,
                      msg: "Succcessfully reterieved currencies.",
                      currenciesArr,
                      cached: false
                    };
    
                    // CACHED THE CURRENCY ARRAY
                    redis.client.setex('currencies', 345600, JSON.stringify(returnObj));
                    
                    
                    // SAVE THE CURRENCY ARRAY TO DB FOR TRACKING PREDICTING IN FUTURE
                    const currency_rates: any = await this.create({
                      exchange_provider,
                      base_currency: 'usd',
                      base_amount: 1.00,
                      currencies_rates: JSON.stringify(currenciesArr),
                      status: 'cached',
                    }, 'currency_exchange_rates');
    
                    if(currency_rates) {
                      returnObj.db_rates = currency_rates;
                    } else {
                      returnObj.db_rates = null;
                    }
    
                    // SEND THE FINAL RESPONSE AS PROMISE
                    resolve(returnObj);
                    
                  } else {
                    reject({ 
                      status: 500,
                      msg: "Oops! Unable to reterieve currencies.",
                      currenciesArr: []
                    });
                  }
                }
              });
            }
          }).catch((err: any) => {
            if(err.connected) {
              console.log('>>>>REDIS', err.connected);
              reject({ 
                status: 500,
                msg: "Oops! Something went wrong while setting up caching policy. Unable to connect to Cache",
                currenciesArr: []
              });
            }
          });
        } catch (err: any) {
          console.log('>>>>>ERR', err);
          return reject({ status: 500, msg: err});
        }
      });
    }

    returnPromiseResp = (res: any, status: any, obj: any) => {
      if(res !== null) {
        return res.status(status).json(obj);
      } else {
        return new Promise(resolve => resolve(obj));
      } 
    }

    getRenewalDate = (type: string) => {
      let dt = new Date();
      type = type.toLowerCase();
      if(type === 'monthly') {
          console.log(dt.getMonth() + 2);
          // RETURN MONTHLY RENEW DATE
          return moment().add(1, 'month').format('MMMM DD, YYYY');
      } else if(type === 'quarterly') {
          // RETURN QUARTERLY RENEW DATE
          return moment().add(3, 'month').format('MMMM DD, YYYY');
      } else {
          // RETURN YEARLY RENEW DATE
          return moment(dt).add(1, 'year').format('MMM DD, YYYY');
      }
    }

    setStripeRegion = (req: any) => {
      let ip = req.body.ip;
      let locObj = geoip.lookup(ip);

      let city = locObj === null ? null : locObj.city;
      let country = locObj === null ? null : locObj.country;
      let timezone = locObj === null ? null : locObj.timezone;
      console.log(ip);

      let localCurrencyObj = countryCurrency.getAllInfoByISO(country);
      console.log(localCurrencyObj);
      
      let localCurrencySymbol = localCurrencyObj.symbol;
      let localCurrency = localCurrencyObj.currency;
      country = localCurrencyObj.countryName;

      let ARAB_COUNTRY = false;

      for(let k=0; k < this.ARAB_COUNTRIES.length; k++) {
        console.log(`>>>>>> ${country}`, `>>>>>> ${this.ARAB_COUNTRIES[k]}`)
        if(country.toLowerCase().includes(this.ARAB_COUNTRIES[k].toLowerCase())) {
          // THE REGION IS GCC / MIDDLEEAST / ARAB WORLD
          console.log('>>>>> USING GCC STRIPE KEY');
          console.log(config.STRIPE_GCC_SECRET_KEY);
          this.stripe = stripe(config.STRIPE_GCC_SECRET_KEY, {
            apiVersion: '2020-08-27',
          });
          ARAB_COUNTRY = true;
          break;
        }
      };

      if(!ARAB_COUNTRY) {
        console.log('>>>>> USING WEST STRIPE KEY');
        // THE REST OF THE WORLD ASIA / EUROPE / USA / CANADA / AUSTRALIA / WEST
        console.log(config.STRIPE_SECRET_KEY);
        this.stripe = stripe(config.STRIPE_SECRET_KEY, {
          apiVersion: '2020-08-27',
        });
      }
    }

    getLocalStripePrice = (req: any) => {
      let ip = req.body.ip;
      let locObj = geoip.lookup(ip);

      let city = locObj === null ? null : locObj.city;
      let country = locObj === null ? null : locObj.country;
      let timezone = locObj === null ? null : locObj.timezone;
      console.log(ip);

      let localCurrencyObj = countryCurrency.getAllInfoByISO(country);
      console.log(localCurrencyObj);
      
      let localCurrencySymbol = localCurrencyObj.symbol;
      let localCurrency = localCurrencyObj.currency;
      country = localCurrencyObj.countryName;

      let ARAB_COUNTRY = false;
      let price = 1;
      let currency = 'usd';
      let sales_tax: any = [config.DEFAULT_TAX];

      for(let k=0; k < this.ARAB_COUNTRIES.length; k++) {
        if(country && country.toLowerCase().includes(this.ARAB_COUNTRIES[k].toLowerCase())) {
          // THE REGION IS GCC / MIDDLEEAST / ARAB WORLD
          console.log('>>>>> USING GCC PRICING');
          if(req.body.hasOwnProperty('amount')) {
            price = (req.body.amount * 3.68);
            price = price + ((price * 2.9) / 100) + 1;
          }
          currency = 'aed';
          sales_tax = [];
          ARAB_COUNTRY = true;
          break;
        }
      };

      if(!ARAB_COUNTRY) {
        console.log('>>>>> USING WEST PRICING');
        // THE REST OF THE WORLD ASIA / EUROPE / USA / CANADA / AUSTRALIA / WEST
        if(req.body.hasOwnProperty('amount')) {
          price = req.body.amount;
        }
      }

      return {
        price,
        currency,
        sales_tax,
        arab: ARAB_COUNTRY
      }
    }

    AddUpdateBillingDetails = async (req: any, res: any) => {
      try {
        this._db = req.db;

        let {
          first_name,
          last_name,
          country,
          city,
          state,
          zipcode,
          address,
          email
        } = req.body;

        const billing: any = await this.findAllByCondition({
          where: { email: req.body.email }
        }, 'org_billing_details');
        console.log('>>>>>>>>>BILIING DHJ',billing)
        if(billing.length === 0) {
          console.log('>>>> IAMHERE IN BILLING OBJ DETAILS', req.body);
          // ADD THE BILLING DETAILS
          let details: any = this.create({
            first_name,
            last_name,
            country,
            city,
            state,
            zipcode,
            address,
            email,
            status: 'active'
          }, 'org_billing_details');

          if(details) {
            res.status(200).json({
              status: 200,
              msg: "Successfully added your billing details",
              details: details.id 
            });
          } else {
            res.status(200).json({
              status: 500,
              msg: "Something went wrong while adding your details",
              details: null
            });
          }
        } else {
          // UPDATE THE BILLIG DETAILS
          let details: any = await this.updateByCondition({
            where: { email: req.body.email }
          }, req.body, 'org_billing_details');

          if(details) {
            res.status(200).json({
              status: 200,
              msg: "Successfully updated your billing details",
              details: details.id 
            });
          } else {
            res.status(200).json({
              status: 500,
              msg: "Something went wrong while updating your details",
              details: null
            });
          }
        }
      } catch(err) {
        res.status(200).json({
          status: 500,
          msg: `Something went wrong while adding your billing details. ERR: ${err}`
        })
      }
    }

    FetchCardBillingDetails = async (req: any, res: any) => {
      try {
        this._db = req.db;

        const billing: any = await this.findAll('org_billing_details');

        if(billing.length > 0) {
          res.status(200).json({
            status: 200,
            msg: 'Successfully got the card billing details.',
            billing
          })
        } else {
          res.status(200).json({
            status: 200,
            msg: 'No valid billing details found with any of associated card.',
            billing: []
          })
        }
      } catch(err) {
        res.status(500).json({
          status: 500,
          msg: `Something went wrong while fetching your card details. ERR: ${err}`
        });
      }
    }

    DeactivateBillingPlan = async (req: any, res: any) => {
      try {
        this.setStripeRegion(req);
        let { plan_type, orgName, email } = req.body;
        this._db = (await req.dbConn).conn[orgName];
        let subscriptionResults: any = await this.findAll('org_billing_capture');
        console.log('>>>>>>',subscriptionResults)
        if(subscriptionResults.length > 0) {
          // CHECK WHICH PLAN SUBSCRIPTION HAS TO BE CANCELED
          let productsArr = [];
          for(let subs of subscriptionResults) {
          let items = JSON.parse(subs.items);
            if(items.data.length > 0) {
              for(let prd of items.data) {
                let prdID = prd.plan.product;
                console.log('>>>>>>> PRD ID:', prdID);
                // NEED TO CHECK PROPER STRIPE METHOD TO FIND PRODUCT VIA ID
                let product: any = await this.stripe.products.retrieve(prdID);
                console.log('>>>>>>>', product);
                product.item_id = prd.id;
                if(product) {
                  productsArr.push({product, subs: subs.subscription_id});
                } 
              }
            } else {
              res.status(200).json({
                status: 500,
                msg: 'Incorrect or missing billing subscription details.'
              })
            }
          }

          for(let prd of productsArr) {
            // CHECK IF THE PRODUCT IS SAME WHICH USER WANTS TO DEACTIVATE
            if(prd.product.name.toLowerCase().includes(plan_type.toLowerCase())) {
              const deletedSubscription = await this.stripe.subscriptions.update(
                prd.subs,
                {items: [{id: prd.product.item_id, deleted: true}]}
              );
      
              if(deletedSubscription) {
              // NOW DEACTIVATE BILLING & PRODUCTS
                const billing: any = this.updateByCondition({
                  where: {
                    "package_name": {
                      [Op.like]: `%${prd.product.name.toUpperCase().replaceAll(" ", "_")}%`
                    }
                  }
                }, { status: "deactivated" }, 'org_billing');

                const orgProducts: any = this.updateByCondition({
                  where: {
                    "name": {
                      [Op.like]: `%${prd.product.name.toUpperCase()}%`
                    }
                  }
                }, { status: "deactivated" }, 'org_products');

                if(billing && orgProducts) {
                  let transporter = nodemailer.createTransport(config.mail);
                  fs.readFile(path.join(__dirname, '../templates/emails/supportNotification.pug'),
                  'utf8',
                  async (err: any, data: any) => {
                    if (err) throw err;
                    let message = `
                      A cancellation request of product "${prd.product.name.toUpperCase()}" has been placed by the user. 
                      Its billing and all relevant DB details has been cencelled and processed successfully. 
                      Please cancel the product details from the Server infrastructure side itself.
                      Product subscription ID: ${subscriptionResults[0].subscription_id}
                      Single Item subscription ID: ${prd.product.id}
                      Product ID: ${prd.product.id}
                    `;
                    let fn = pug.compile(data);
                    let emailTemp = fn({
                      orgName,
                      email,
                      message
                    });
                    // send mail with defined transport object
                    let info = transporter.sendMail({
                        from: '"WorkOne Admin" <admin@workone.company>', // sender address
                        to: '"WorkOne Support" <support@workone.company>', // list of receivers
                        subject: "Action Required! User Service Cancellation", // Subject line
                        text: "User service cancellation request from Dashboard, Action Required.", // plain text body
                        html: emailTemp, // html body
                    });
                    res.status(200).json({
                      status: 200,
                      msg: 'Successfully processed billing cancellation and plan has been deactivated now.'
                    });
                  });
                } else {
                  res.status(200).json({
                    status: 500,
                    msg: 'Cancellation of billing has been processed but failed to update the information, please try again or reach to WorkOne support.'
                  });
                }
              } else {
                res.status(200).json({
                  status: 500,
                  msg: 'Unable to process the cancellation of billing, please try again or reach to WorkOne support.'
                });
              }
            }
          }
        } else {
          res.status(200).json({
            status: 500,
            msg: 'No relevant billing details found.'
          })
        }
      } catch(err) {
        res.status(200).json({
          status: 500,
          msg: `Something went wrong while deactivating your plan. ERR: ${err}`
        });
      }
    }

    TurnOffAutoRenew = async (req: any, res: any) => {
      try {

      } catch(err) {
        res.status(200).json({
          status: 500,
          msg: `Something went wrong while turning off auto renewal of your plan. ERR: ${err}`
        });
      }
    }
}
****/