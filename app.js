var budgetController = (function () {
	
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}

	Expense.prototype.calcPercentage = function (totalsInc) {
		if(totalsInc > 0) {
			this.percentage = Math.round( (this.value / totalsInc) * 100);
		}else{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var calculateTotals = function (type) {
		var s = 0;

		data.allItems[type].forEach(function (cur) {
			s += cur.value;
		});

		data.totals[type] = s;
	}

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	}

	return {
		addItem: function (type, des, val) {
			var newItem, ID;

			// create ID
			if(data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			} else {
				ID = 0;
			}

			//create new item
			if(type === "exp") {
				newItem = new Expense(ID, des, val);
			}else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}

			data.allItems[type].push(newItem);

			return newItem;
		},

		deleteItem: function (type, id) {
			var index, ids;

			ids = data.allItems[type].map(function (cur) {
				return cur.id;
			});

			index = ids.indexOf(id);

			if(index !== -1) {
				data.allItems[type].splice(index, 1);
				console.log('Deleted');
			}
		},

		calculateBudget: function () {
			// Calculate the totals
			calculateTotals('inc');
			calculateTotals('exp');

			// Calculate the budget
			data.budget = data.totals.inc - data.totals.exp;

			// Calculate the percentage
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}else {
				data.percentage = -1;
			}
		},

		getBudget: function () {
			return {
				budget: data.budget,
				totalsInc: data.totals.inc,
				totalsExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		calculatePercentages: function () {
			data.allItems.exp.forEach(function (cur) {
				cur.calcPercentage(data.totals.inc);
				// console.log(cur);
			});
		},

		getPercentages: function () {
			var allPerc = data.allItems.exp.map(function (cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		testing: function () {
			console.log(data);
		}
	}
})();

var UIController = (function () {
	
	var DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensePercLabel: ".item__percentage",
		monthLabel: ".budget__title--month"
	};

	var formatNum = function (num, type) {
		if(num === 0) return num;
		
		num = Math.abs(num);
		num = num.toFixed(2);

		return ( type === 'inc' ? '+' : '-') + ' ' + num;
	}

	return {
		getInput: function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			}
		},

		addListItem: function (obj, type) {
			var html, newHtml, element;

			// Create HTML string with the placeholder text
			if(type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if (type === 'exp') {
				element = DOMstrings.expensesContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data
			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNum(obj.value, type));

			// Insert the HTML string into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function (selectorId) {
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (current, index, array) {
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		displayBudget: function (obj) {
			var budgetType;

			if (obj.budget > 0){
				budgetType = 'inc';
			}else{
				budgetType = 'exp';
			}

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget, budgetType);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNum(obj.totalsInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNum(obj.totalsExp, 'exp');
			
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function (percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

			/*
			var nodelistForEach = function (list, callback) {
				for (var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			};

			nodelistForEach(fields, function (cur, index) {
				if (percentages[index] > 0) {
					cur.textContent = percentages[index] + '%';
				} else {
					cur.textContent = '---';
				}
			});
			*/

			Array.prototype.forEach.call(fields, function (cur, index) {
				if (percentages[index] > 0) {
					cur.textContent = percentages[index] + '%';
				} else {
					cur.textContent = '---';
				}
			});
		},

		displayMonth: function () {
			var now, year, month, months;

			now = new Date();
			months = ['January', 'Febrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			month = now.getMonth();
			year = now.getFullYear();

			document.querySelector(DOMstrings.monthLabel).textContent = months[month - 1] + ' ' + year;
		},

		changeType: function () {
			var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' +DOMstrings.inputValue);

			Array.prototype.forEach.call(fields, function (cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		
		getDOMstrings: function () {
			return DOMstrings;
		}
	}

})();

var controller = (function (budgetCtrl, UICtrl) {

	var setupEventListener = function () {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

		document.addEventListener("keypress", function (event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};

	var updateBudget = function () {
		// Calculate the budget
		budgetCtrl.calculateBudget();

		// Get the budget, total, percentage
		var budget = budgetCtrl.getBudget();

		// Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function () {
		
		// 1. Calculate the percentages
		budgetCtrl.calculatePercentages();

		// 2. Read the percentages in the budgetCtrl
		var percentages = budgetCtrl.getPercentages();

		// 3. Display the percentages on the UI
		// console.log(percentages);
		UICtrl.displayPercentages(percentages);
	}

	var ctrlDeleteItem = function (event) {
		var itemID, ID, splitID, type;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. Delete the item from data
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update the budget
			updateBudget();

			// 4. Calculate and display the percentages 
			updatePercentages();
		}
		
	}

	var ctrlAddItem = function () {
		var input, newItem;

		// 1. Get the field input 
		input = UICtrl.getInput();
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add new item into Budget data
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add new item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();

			// 5. Calculate and print the budget
			updateBudget();

			// 6. Calculate and display the percentages
			updatePercentages();
		}
	};
	
	return {
		init: function () {
			console.log("Application has started!");
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalsInc: 0,
				totalsExp: 0,
				percentage: -1
			});
			setupEventListener();
		}
	}

})(budgetController, UIController);

controller.init();