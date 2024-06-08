const getAccessToken = async () => {
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`)
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials'
        })
    });
    const responseJSON = await response.json();
    return responseJSON.access_token;
}

export const createOrder = async (dreamId, dreamName, contributionId, dreamAuthorPaypalAddress, contributionAmount) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "items": [
                        {
                            "name": `Příspěvek na realizaci snu: ${dreamName}`,
                            "quantity": 1,
                            "unit_amount": {
                                "currency_code": "CZK",
                                "value": `${contributionAmount}`
                            }
                        }
                    ],
                    "amount": {
                        "currency_code": "CZK",
                        "value": `${contributionAmount}`,
                        "breakdown": {
                            "item_total": {
                                "currency_code": "CZK",
                                "value": `${contributionAmount}`
                            }
                        }
                    },
                    "payee": {
                        "email_address": `${dreamAuthorPaypalAddress}`
                    }
                }
            ],
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                        "brand_name": "dreamify",
                        "locale": "cs-CZ",
                        "landing_page": "LOGIN",
                        "user_action": "PAY_NOW",
                        "return_url": `${process.env.BASE_URL}/dreams/${dreamId}/contributions/${contributionId}/complete`,
                        "cancel_url": `${process.env.BASE_URL}/dreams/${dreamId}/contributions/${contributionId}/cancel`
                    }
                }
            }
        })
    })
    //return order.links.find(link => link.rel === 'payer-action').href;
    return await response.json();
}

export const capturePayment = async (orderId) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    })
    return response.json();
}
