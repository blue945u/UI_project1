var fdApp = angular.module('app', ['ngRoute']);

/**
 * An AngularJS filter used for converting the cart from object to array before printing it in order in the html code.
 */
fdApp.filter("toArray", function(){
    return function(obj) {
        var result = [];
        angular.forEach(obj, function(val, key) {
            result.push(val);
        });
        return result;
    };
});

/**
 * The routes for the bartender system.
 */
fdApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/bartender/inventory', {
            templateUrl: 'inventory.html'
        }).
        when('/bartender/users', {
            templateUrl: 'users.html'
        }).
        when('/bartender/purchases', {
            templateUrl: 'purchases.html'
        }).
        otherwise({
            redirectTo: '/bartender/inventory'
        });
}]);

/**
 * AngularJS directive used for the dragging operation in drag-and-drop.
 */
fdApp.directive('draggable', function() {
  return function(scope, element) {
        // Fetch the native JS object.
        var el = element[0];

        // Make the element draggable.
        el.draggable = true;

        // Listen for a 'dragstart' event.
        el.addEventListener(
            'dragstart',
            function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('Text', this.id);
                this.classList.add('drag');
                scope.$apply(function(scope){
                  scope.showCart();
                });
                return false;
            },
            false
        );

        // Listen for a 'dragend' event.
        el.addEventListener(
            'dragend',
            function(e) {
                this.classList.remove('drag');
                return false;
            },
            false
        );
    }
});

/**
 * AngularJS directive used for the dropping operation in drag-and-drop.
 */
fdApp.directive('droppable', function() {
    return {
        scope: { drop: '&' }, // Parent
        link: function(scope, element) {
            // Fetch the native JS object.
            var el = element[0];

            // Listen for a 'dragover' event.
            el.addEventListener(
              'dragover',
              function(e) {
                e.dataTransfer.dropEffect = 'move';
                if (e.preventDefault) e.preventDefault();
                this.classList.add('over');
                return false;
              },
              false
            );

            // Listen for a 'dragenter' event.
            el.addEventListener(
              'dragenter',
              function(e) {
                this.classList.add('over');
                return false;
              },
              false
            );

            // Listen for a 'dragleave' event.
            el.addEventListener(
              'dragleave',
              function(e) {
                this.classList.remove('over');
                return false;
              },
              false
            );

            // Listen for a 'drop' event.
            el.addEventListener(
              'drop',
              function(e) {
                // Stops some browsers from redirecting.
                if (e.stopPropagation) e.stopPropagation();

                this.classList.remove('over');

                var id = e.dataTransfer.getData('Text');
                scope.$apply(function(scope) {
                  var fn = scope.drop();
                  if ('undefined' !== typeof fn) {
                    fn(id);
                  }

                  return false;
                });
              },
              false
            );
        }
    }
});

/**
 *  Holder for the long uninteresting api urls.
 *  Just for clearing up duplicate strings in the code.
 */
fdApp.factory('urls', function() {
    var urls = {
        apiURL: 'http://pub.jamaica-inn.net/fpdb/api.php',
        invURL: '?action=inventory_get',
        beerURL: '?action=beer_data_get&beer_id=',
        buyURL: '?username=jorass&password=jorass&action=purchases_append&beer_id='
    }
    return urls;
});


/**
 * AngularJS factory for fetching data from the database nicely.
 */
fdApp.factory('apiService', function(urls, $http) {
  var apiService = {
    // One asynchronical request.
    async: function(url) {
        return $http.get(url).then(function (response) {
          return response.data;
        });
    },
    // Get the data from the api-request(URL) and apply callBack once finished.
    getData: function(url, callBack) {
      apiService.async(url).then(callBack);
    },
    // Get the full inventory from the database.
    getFullInv: function() {
        var p = apiService.async(urls.apiURL + urls.invURL).then(response => {
            var beerUrl = urls.apiURL + urls.beerURL;
            var new_reqs = response.payload.map(d => {
                return $http.get(beerUrl + d.beer_id);
            });
            return Promise.all(new_reqs);
        }).then(data => {
            return data;
        });
        return p;
    },
    // Place an order to the api, cart comes as argument
    placeOrder: function(cart) {
        var reqList = Object.keys(cart).map(key => {
            var cartItem = cart[key];
            var orderUrl = urls.apiURL + urls.buyURL + cartItem.item.nr;

            return $http.get(orderUrl);
        });
        return Promise.all(reqList).then(response => {return response});
    }
  };
  return apiService;
});

/**
 * AngularJS contoller for the customer system.
 */
fdApp.controller('beerlistcontroller', (apiService, urls, $scope, $http) => {
    // Translations.
    translations = {
        en: {
            cart: 'Your order',
            order: 'Order',
            vipLogin: 'VIP Login',
            undo: 'Undo',
            redo: 'Redo',
            beerList: 'Show beverages',
            dropbox: 'Drop your beverages here',
            totalSum: 'Total Sum',
            search: 'Search',
            searchPlaceholder: 'Enter the name of a beer here',
            clear: 'Clear',
            organic: 'ORGANIC!',
            outOfStock: 'OUT OF STOCK!',
            countryName: 'Country',
            userName: 'Username',
            password: 'Password',
            loginHead: 'Login',
            loginbutton: 'Login',
            logout: 'Logout',
            profile: 'Profile',
            assets: 'Assets',
            hi: 'Hi',
            sortBy: 'Sort by',
            showOutOfStock: 'Show beverages out of stock',
            orderTab: 'O R D E R',
            introHeading: 'Welcome!',
            introText: 'The Flying Dutchman is a small pub that has been loved by its visitors since its origin back in 1889. It has been passed down through the generations until today. We can offer you a large number of selected special beers and fine wines. Find your favorites, and enjoy your stay!',
            glutenFree: 'Gluten free'
        },
        sv: {
            cart: 'Din best&auml;llning',
            order: 'Best&auml;ll',
            vipLogin: 'Logga in som VIP',
            undo: '&Aring;ngra',
            redo: 'Upprepa',
            beerList: 'Visa drycker',
            dropbox: 'Sl&auml;pp dina drycker h&auml;r',
            totalSum: 'Summa',
            search: 'S&ouml;k',
            searchPlaceholder: 'Skriv namnet p&aring; &ouml;len h&auml;r',
            clear: 'Rensa',
            organic: 'EKOLOGISK!',
            outOfStock: 'SLUT I LAGER!',
            countryName: 'Land',
            userName: 'Anv&auml;ndarnamn',
            password: 'L&ouml;senord',
            loginHead: 'Logga in',
            loginbutton: 'Logga in',
            logout: 'Logga ut',
            profile: 'Profil',
            assets: 'Tillg&aring;ngar',
            hi: 'Hej',
            sortBy: 'Sortera efter',
            showOutOfStock: 'Visa drycker som &auml;r slut i lagret',
            orderTab: 'B E S T &Auml; L L N I N G',
            introHeading: 'V&auml;lkommen!',
            introText: 'The Flying Dutchman &auml;r en liten pub som har varit &auml;lskad av sina bes&ouml;kare sedan den startades &aring;r 1889. Den har g&aring;tt i arv fr&aring;n generation till generation tills idag. Vi kan erbjuda dig ett stort antal speciellt utvalda &ouml;l och fina viner. Hitta dinna favoriter, och njut av din vistelse!',
            glutenFree: 'Glutenfritt'
        }
    };

    // Specify default language.
    $scope.language = 'en';
    $scope.lang = translations[$scope.language];

    // Initialize the beer list.
    $scope.items = {};
    // Initialize the item list for the view.
    $scope.preppedItems = [];

    // Initialize shopping cart.
    $scope.cart = {};

    /**
     *   Fetch all item data from the database asynchronically.
     *   Don't continue until we have fetched all of it.
     */
    apiService.getFullInv().then(r => {
        //GET FULL ITEM DATA
        r.forEach(item => {
            var data = item.data.payload[0];
            if (data) {
                $scope.items[data.nr] = data;
            }
        });
        // Add the count for each item, as the database is broken.
        apiService.async(urls.apiURL + urls.invURL).then(r => {
            Object.keys(r.payload).forEach(key => {
                var me = r.payload[key];
                if (me) {
                    if (me.namn) {
                        $scope.items[me.beer_id]['count'] = parseInt(me.count);
                        $scope.preppedItems.push($scope.items[me.beer_id]);
                    }
                }
            });
            // Make sure that a $digest isn't already in progress.
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
        // APPLY FILTERS SHOULD COME HERE?
    });

    /**
     * Translates all translatable phrases on the page to the specified language.
     *
     * Available languages: Swedish (sv), English (en)
     *
     * @param lang Abbreviation of the language to translate to
     */
    $scope.setLanguageJS = function(lang) {
        translatableElements = document.getElementsByClassName('lang');

        for (key in translatableElements) {
            phrase = translatableElements[key].getAttribute('tkey');
            translatableElements[key].innerHTML = translations[lang][phrase];
        }
    }

    /**
     * Adds an item to the shopping cart.
     *
     * @param item The item to add to the cart
     */
    $scope.addToCart = function(item) {
        $scope.addToCartById(item.nr);
    }

    /**
     * Adds the item with the given id to the shopping cart. An item with the given id must exists in the items array.
     *
     * @param id The id of the item to add to the cart
     */
    $scope.addToCartById = function(id) {
        var item = $scope.items[id];
        // Check whether the item exists in the cart already
        if (item.nr in $scope.cart) {
            if ($scope.cart[item.nr].quantity >= item.count) {
                return;
            }

            $scope.cart[item.nr].quantity++;
            $scope.undos.push({action: 'add', item: item});
            $scope.redos = [];
            $scope.updateTotalSum();
            return;
        }

        // Check that the item is in stock
        if (item.count < 1) {
            return;
        }

        // If it does not exist in the cart, add it
        $scope.cart[item.nr] = {item: item, quantity: 1};
        $scope.undos.push({action: 'add', item: item});
        $scope.redos = [];
        $scope.updateTotalSum();
    }

    /**
     * Removes the given item from the shopping cart.
     *
     * @param item The item to remove from the cart
     */
    $scope.removeFromCart = function(item) {
        var cartItem = $scope.cart[item.nr];
        // Find the item
        if (cartItem.quantity <= 1) {
            delete $scope.cart[item.nr];
        } else {
            $scope.cart[item.nr].quantity--;
        }
        // Add action as redo
        $scope.undos.push({action: 'remove', item: item});
        $scope.redos = [];
        $scope.updateTotalSum();
    }

    // Contains the total sum of the items in the cart.
    $scope.cartSum = 0;

    /**
     * Updates the total sum of the items in the shopping cart.
     */
    $scope.updateTotalSum = function() {
        var sum = 0;
        var cartIDs = Object.keys($scope.cart);
        for (var n in cartIDs) {
            var key = cartIDs[n];
            sum = sum + ($scope.cart[key].item.prisinklmoms * $scope.cart[key].quantity);
        }
        $scope.cartSum = sum.toFixed(2);
    }

    // Contains undo-redo history elements like {action: 'add', item: <item>}.
    $scope.undos = [];
    $scope.redos = [];

    /**
     * Undoes an action in the undo history and places it in the redo history. If the undo history is empty, nothing is done.
     */
    $scope.undo = function() {
        if ($scope.undos.length > 0) {
            var undo = $scope.undos.pop();
            $scope.redos.push(undo);

            if (undo.action == "add") {
                var redos = $scope.redos;
                $scope.removeFromCart(undo.item);
                $scope.undos.pop(); // removeFromCart pushes an an undo item, so we need to remove it manually.
                $scope.redos = redos; // removeFromCart removes the redos, so we need to restore them manually.
            } else if (undo.action == "remove") {
                var redos = $scope.redos;
                $scope.addToCart(undo.item);
                $scope.undos.pop(); // addToCart pushes an an undo item, so we need to remove it manually.
                $scope.redos = redos; // addToCart removes the redos, so we need to restore them manually.
            }
        }
    }

    /**
     * Redoes an action in the redo history and places it in the undo history. If the redo history is empty, nothing is done.
     */
    $scope.redo = function() {
        if ($scope.redos.length > 0) {
            var redo = $scope.redos.pop();
            $scope.undos.push(redo);

            if (redo.action == "add") {
                var redos = $scope.redos;
                $scope.addToCart(redo.item);
                $scope.undos.pop(); // addToCart pushes an an undo item, so we need to remove it manually.
                $scope.redos = redos; // addToCart removes the redos, so we need to restore them manually.
            } else if (redo.action == "remove") {
                var redos = $scope.redos;
                $scope.removeFromCart(redo.item);
                $scope.undos.pop(); // removeFromCart pushes an an undo item, so we need to remove it manually.
                $scope.redos = redos; // removeFromCart removes the redos, so we need to restore them manually.
            }
        }
    }

    /**
     * Empties the shopping cart, removes all undo and redo history and resets the total sum to zero.
     */
    $scope.clearCart = function() {
        $scope.cart = {};
        $scope.undos = [];
        $scope.redos = [];
        $scope.updateTotalSum();
    }

    /**
     * Adds the item with the given id to the shopping cart. An item with the given id must exists in the items array.
     *
     * @param id The id of the item to add to the cart
     */
    $scope.drop = function(id) {
        $scope.addToCartById(id);
    }

    /**
     * Places an order through the API of all the items in the shopping cart. It also empties the cart and undo-redo history and resets the total sum to zero.
     */
    $scope.order = function() {
        apiService.placeOrder($scope.cart).then(r => {
            $scope.clearCart();

            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    }

    /**
     * Toggles the beer list from being shown.
     */
    $scope.showBeerList = function() {
        $scope.selected = !$scope.selected;
      }

    /**
     * Toggles the cart from being shown.
     */
    $scope.showCart = function() {
        $scope.cartShown = true;
    }

    // Login-related variables.
    $scope.user = null;
    $scope.loggedIn = false;
    $scope.loginError = null;
    $scope.showLogin = false;
    $scope.showProfile = false;

    /**
     * Logs into a user account. If the login credentials are invalid an error message is set.
     *
     * @param username The account's username
     * @param password The account's password
     */
    $scope.login = function(username, password) {
        apiService.async(urls.apiURL + '?username=' + username + "&password=" + password + '&action=iou_get').then(response => {

            if (response.type == "iou_get") {
                sessionStorage.setItem("username", username);
                sessionStorage.setItem("password", password);
                $scope.user = response.payload[0];
                $scope.loggedIn = true;
                $scope.loginError = null;
                $scope.showLogin = false;
                $scope.showProfile = true;
            } else {
                $scope.logout();

                if (response.payload[0].code == "1") {
                    $scope.loginError = "Username not found";
                } else if (response.payload[0].code == "2") {
                    $scope.loginError = "Incorrect password";
                }
            }

            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    }

    /**
     * Logs out of the currently logged in account. If no user is logged in, nothing is done.
     */
    $scope.logout = function() {
        sessionStorage.clear();
        $scope.user = null;
        $scope.loggedIn = false;
        $scope.showProfile = false;
    };

    // Check whether user credentials are stored in session storage and log in using them.
    if (sessionStorage.getItem("username") != null && sessionStorage.getItem("username") != "") {
        var username = sessionStorage.getItem("username");
        var password = sessionStorage.getItem("password");
        $scope.login(username, password);
    }

    // Sort options in the dropdown filter.
    $scope.sortmodes = [{
        name: 'Name',
        value: 'namn'
    }, {
        name: 'Price',
        value: 'prisinklmoms'
    }, {
        name: 'Alcohol',
        value: 'alkoholhalt'
    }];

    // Set default sortmode.
    $scope.sortmode = $scope.sortmodes[0];

    // Boolean to set whether beer items out of stock should be shown in the list.
    $scope.showOutOfStock = false;

    /**
     * Returns the current number of items in the cart.
     *
     * @returns The current number of items in the cart
     */
    $scope.cartLength = function() {
        return Object.keys($scope.cart).length;
    };

    /**
     * AngularJS filter expression to check if a beer is gluten free.
     *
     * @returns A function that takes an item and returns true if the item does not contain the string 'vete' in its 'varugrupp' property, else false
     */
    $scope.isGlutenFree = function() {
        return function(item) {
            return item.varugrupp.toLowerCase().indexOf('vete') == -1;
        }
    };
});

/**
 * AngularJS contoller for the bartender system.
 */
fdApp.controller('BartenderCtrl', function($scope, apiService, urls) {
    /**
     * Logs out of the currently logged in account. If no user is logged in, nothing is done.
     */
    $scope.logout = function() {
        sessionStorage.clear();
        window.location = 'login.html';
    };

    // Check if the user is "logged in", if not redirect to login.
    if (sessionStorage.getItem("username") != null && sessionStorage.getItem("username") != "") {
        $scope.username = sessionStorage.getItem("username");
        $scope.password = sessionStorage.getItem("password");
    } else {
        $scope.logout();
    }

    // Initialize the user and purchase lists.
    $scope.users = [];
    $scope.purchases = [];

    // Initialize the beer list.
    $scope.items = {};
    // Initialize the item list for the view.
    $scope.inventory = [];

    /**
     *   Fetch all item data from the database asynchronically.
     *   Don't continue until we have fetched all of it.
     */
    apiService.getFullInv().then(r => {
        //GET FULL ITEM DATA
        r.forEach(item => {
        var data = item.data.payload[0];
    if (data) {
        $scope.items[data.nr] = data;
    }
    });
    // Add the count for each item, as the database is broken.
    apiService.async(urls.apiURL + urls.invURL).then(r => {
        Object.keys(r.payload).forEach(key => {
        var me = r.payload[key];
    if (me) {
        if (me.namn) {
            $scope.items[me.beer_id]['count'] = parseInt(me.count);
            $scope.inventory.push($scope.items[me.beer_id]);
        }
    }
    });
    // Make sure that a $digest isn't already in progress.
    if(!$scope.$$phase) {
        $scope.$apply();
    }
    });
    });

    /**
     * Fetch all users from the database asynchronically.
     */
    apiService.async(urls.apiURL + '?action=iou_get_all').then(r => {
        $scope.users = r.payload;
    });

    /**
     * Fetch all purchases from the database asynchronically.
     */
    apiService.async(urls.apiURL + '?username=' + $scope.username + '&password=' + $scope.password + '&action=purchases_get_all').then(r => {
        $scope.purchases = r.payload;
    });

    // Holds an item to be shown in a modal window.
    $scope.activeItem = null;

    /**
     * Sets the item to be shown in the modal window.
     *
     * @param item The item to be shown in the modal window.
     */
    $scope.setActiveItem = function(item) {
        $scope.activeItem = item;
    };

    /**
     * Increases the count of an item with the given amount.
     *
     * @param item The item which count to increase
     * @param amount The amount to increase the item's count with
     */
    $scope.increaseCount = function(item, amount) {
        var a = parseInt(amount);
        var count = parseInt(item.count);

        if (a > 0) {
            item.count = count + a;
        }
    };

    /**
     * Updates the given user's profile through the API.
     *
     * @param user The user to update
     * @param new_username The new username
     * @param new_password The new password
     * @param first_name The new first name
     * @param last_name The new last name
     * @param email The new email
     * @param phone The new phone number
     */
    $scope.updateUser = function(user, new_username, new_password, first_name, last_name, email, phone) {
        var request = urls.apiURL + '?action=user_edit'
            + '&username=' + user.username
            + '&password=' + user.username
            + '&new_username=' + new_username
            + '&new_password=' + new_password
            + '&first_name=' + first_name
            + '&last_name=' + last_name
            + '&email=' + email
            + '&phone=' + phone;

        apiService.async(request).then(r => {
            if (r.type != 'error') {
                console.log(r.type);
            }
        });
    };

    /**
     * Increases the assets for a user with the given amount.
     *
     * @param item The user which assets to increase
     * @param amount The amount to increase the user's assets with
     */
    $scope.increaseAssets = function(user, amount) {
        var a = parseInt(amount);
        var assets = parseInt(user.assets);

        if (a > 0) {
            user.assets = assets + a;
        }
    };

    /**
     * Deletes the given user from the user list.
     *
     * @param user The user to delete from the user list
     */
    $scope.deleteUser = function(user) {
        var index = $scope.users.indexOf(user);
        if (index > -1) {
            $scope.users.splice(index, 1);
        }
    };

    // Sort options in the dropdown filter on the inventory page.
    $scope.sortmodes = [{
        name: '#',
        value: 'nr'
    }, {
        name: 'Count',
        value: 'count'
    }, {
        name: 'Name',
        value: 'namn'
    }, {
        name: 'Name 2',
        value: 'namn2'
    }, {
        name: 'Price',
        value: 'prisinklmoms'
    }, {
        name: 'Alcohol',
        value: 'alkoholhalt'
    }];

    // Set default sortmode.
    $scope.sortmode = $scope.sortmodes[0];
});

/**
 * AngularJS contoller for the bartender login page.
 */
fdApp.controller('LoginCtrl', function($scope, apiService, urls) {
    // Initialize user and error message variables.
    $scope.user = null;
    $scope.loginError = null;

    // All valid admin usernames.
    var admins = [
        'ervtod',
        'hirchr',
        'jorass',
        'saskru',
        'svetor'
    ];

    /**
     * Logs into an admin account. If the login credentials are invalid an error message is set.
     *
     * @param username The account's username
     * @param password The account's password
     */
    $scope.login = function(username, password) {
        apiService.async(urls.apiURL + '?username=' + username + "&password=" + password + '&action=iou_get').then(response => {
            if (response.type == "iou_get") {
                if (admins.indexOf(username) == -1) {
                    $scope.logout();
                    $scope.loginError = "You don't have access to the bartender system";
                    return;
                }

                sessionStorage.setItem("username", username);
                sessionStorage.setItem("password", password);
                $scope.user = response.payload[0];
                $scope.loginError = null;
                window.location = 'bartender.html';
            } else {
                $scope.logout();

                if (response.payload[0].code == "1") {
                    $scope.loginError = "Username not found";
                } else if (response.payload[0].code == "2") {
                    $scope.loginError = "Incorrect password";
                }
            }

            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    };

    /**
     * Logs out of the currently logged in account. If no user is logged in, nothing is done.
     */
    $scope.logout = function() {
        sessionStorage.clear();
        $scope.user = null;
    };

    // Check if the user is already "logged in", if so redirect to the bartender dashboard.
    if (sessionStorage.getItem("username") != null && sessionStorage.getItem("username") != "") {
        var username = sessionStorage.getItem("username");
        var password = sessionStorage.getItem("password");
        $scope.login(username, password);
    }
});