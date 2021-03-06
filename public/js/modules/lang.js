/**
 * Language Constants
 */
angular.module('language', [])

.constant('Language', {
	"set":"eng",
	"eng":{
		"items": {
			"save": {
				"success":"You've succesfully added an order. Note: Items placed with invoice numbers and stock amounts will have their current stock updated. To add another item, close this dialog or return to the dashboard",
				"error": "Something went wrong while carrying out your last request. If it's nothing serious, you can try again. If this error happens again, please inform the Admin"
			},
			"autocomplete":{
				"brandname":"",
				"suppliers":""
			},
			"category":{
				"add":{
					"success":"Category list updated",
					"error": "Error creating an item category"
				},
				"list":{
					"error": "Error Fetching Categories"
				}
			},
			"list":{
				"fetch":{
					"success": "Fetched list of items successfully",
					"error": 'Failed to fetch list of items from the server. Will try again'
				}
			},
			"form": {
				"add":{
					"success": "Item form list updated",
					"error": "Error updating item form list"
				},
				"list":{
					"error":"Error fetching item forms"
				}
			},
			"packaging":{
				"add":{
					"success":"Packaging list updated",
					"error": "Error updating packaging list"
				},
				"list":{
					"error": "Error fetching packaging list"
				}
			},
			"supplier":{
				"typeahead":{
					"error":"Failed to fetch list of suppliers"
				}
			},
			"update": {
				"success": "Item updated successfully",
				"error" : "Failed to update this item"
			}
		},
		"supplier": {
			"add": {
				"success":"You have added a new supplier",
				"error": "An error occured with the last request"
			},
			"update":{
				"success": "You have updated this supplier entry",
				"error": "An error occured with this updated, please try again"
			}
		},
		"order":{
			"update":{
				"success": "This order has been updated",
				"error": "Order update failed"
			},
			"fetch":{
				"error":"Can not fetch the list of recent orders"
			}
		},
		"dispense":{
			"confirm":{
				"amount": {
					"error": "Please check the amount requested is in stock"
				}
			},
			"approve" : {
				"success": "Sent prescription successfully",
				"error" : "Error prescribing items for this patient",
				"fail": "You have not confirmed any items. Check your list"
			},
			"addDrug":{
				"error": "This item is already in the list"
			},
			"bills":{
				"view":{
					"success":"",
					"error": "Error viewing this bill"
				},
				"pay":{
					"success": "Bill payment recorded",
					"error": "Error recording bill payment"
				}
			}
		},
		"bills":{
			"rule":{
				"add":{
					"success": "New billing rule successfully added",
					"error": "Error saving a new billing rule"
				},
				"fetch":{
					"error": "Could not fetch the list of rules"
				}
			},
			"profiles":{
				"create":{
					"success": "Created a new billing profile successfully",
					"error": "Error trying to create a new billing profile"
				},
				"save" : {
					"success": "Updated billing profile",
					"error": "Error updating billing profile"
				},
				"fetch": {
					"error": "I can't fetch the list of saved profiles"
				}
			}
		},
		"stock":{
			"down":{
				"success": "Stock down request sent",
				"error": "Error requesting stock down"
			},
			"location":{
				"create": {
					"success": "Created a new stock down loaction",
					"error": "Could not create a new stock down location"
				}
			}
		},
		"hospital":{
			"register":{
				"success": "New hospital has been added",
				"error": "Could not complete request to add new hospital"
			},
			"fetch":{
				"error": "Could not fetch list of hospitals"
			},
			"delete":{
				"success":"Successfully deleted hospital",
				"error":"Error deleting hospital"
			}
		},
		"drug":{
			"search":{
				"error": "Error occured searching the list of drugs",
				"notfound": "Drug not found"
			},
			"update":{
				"success": "Drug Price Successfully updated",
				"error": "Something went wrong with updating that drug price"
			},
			"summary":{
				"error": "Can not fetch more information now."
			}
		}
	}
});