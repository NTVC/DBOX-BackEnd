var customerModal = "#customerModal";
var deviceModal = "#deviceModal";
var searchDeviceModal = "#searchDeviceModal";

var pathDevice = '/handler/device';
var pathCustomer = '/handler/customer';

$(document).ready(function () {

    $('.datepicker').datepicker();
});

dbox.controller('customerListController', function ($scope, genericService) {
    $scope.customers = null;
    $scope.limits = getShowLimit();
    $scope.countries = getCountries();
    
    $scope.filter = {
        search: (getQueryParams().c ? getQueryParams().c : ""),
        country: '',
        status: (getQueryParams().c ? "" : "1"),
        pg: {
            index: 0, limit: '25',
            range: 0,
            total: 0
        }
    }
    
    // RESET SEARCH FILTER
    $scope.rSearch = function () {
        
        $scope.filter.search = "";
        $scope.filter.pg.index = 0;
        $scope.search();
    };
    
    // SEARCH CUSTOMERS
    $scope.search = function () {
        
        // GET ALL DATA ON THE BASE
        genericService.handler(pathCustomer, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.customers = data;
                addCountryJs();
            }
        });
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.handler(pathCustomer, getFilter(true)).then(function (data) {
            
            $scope.filter.pg.total = data;
            $scope.filter.pg = preparePagination($scope.filter.pg);
        });
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        filter.list = true;
        filter.search = $scope.filter.search;
        filter.status = $scope.filter.status;
        filter.country = $scope.filter.country;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }
        
        return filter;

    }
    
    // NEW CUSTOMER
    $scope.new = function () {
        var data = { status: true };
        setUserModal(data);
    };
    
    // SHOW DEVICES ASSOCIATE
    $scope.device = function (customer) {
        getScope(deviceModal).show(customer);
    };
    
    // EDIT CUSTOMER
    $scope.edit = function (data) {
        
        setUserModal(data);
    };
    
    // DELETE CUSTOMER
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete customer';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the customer <b>' + data.firstname + '</b>?';
        modal.invoke = 'deleteUser';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    // OPEN UP MODAL EDITING
    var setUserModal = function (data) {
        
        var s = getScope("customerModal");
        
        var c = angular.copy(data);
        c.status = String(c.status);
        
        s.customer = c;
        s.old_scope = angular.copy(c);
        
        $(customerModal).modal('show');
    };
    
    // INIT
    $scope.search();
});

dbox.controller('deviceModalController', function ($scope, genericService) {
    
    $scope.customer;
    $scope.devices;
    $scope.loader;
    $scope.countries = getCountries();

    $scope.show = function (customer){
        $scope.customer = customer;
        $scope.getDevices(customer);
        $(deviceModal).modal('show');
    }

    // NEW DEVICE
    $scope.newDevice = function () {
        getScope(searchDeviceModal).newDevice($scope.customer);
    }
    
    // DELETE ASSOCIATION WITH THE DEVICE
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete device';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to disassociate the device <b>' + data.mac + '</b>?';
        modal.invoke = 'deleteAssDevice';
        modal.obj = {device: data, customer: $scope.customer};
        
        setMainModal(modal);
    }
    
    $scope.getDevices = function (customer) {
        
        $scope.loader = true;
        $scope.devices = null;
        // GET ALL DATA ON THE BASE
        genericService.handler(pathDevice, {listByUser: true, customer_id: customer._id}).then(function (data) {
            if (checkMessage(data)) {
                $scope.devices = data;
                $scope.loader = null;
            }
        });
    };
    
});

dbox.controller('searchDeviceModalController', function ($scope, genericService) {
    
    $scope.customer;
    $scope.devices;
    $scope.modal = {loader: null};
    
    $scope.filter = {
        search: '',
        status: '',
        pg: {
            index: 0, 
            limit: '25',
            range: 0,
            total: 0
        }
    }
    
    // NEW DEVICE
    $scope.newDevice = function (customer) {
        $scope.customer = customer;
        $scope.getDevice();
        $(searchDeviceModal).modal('show');
    }
    
    $scope.getDevice = function () {
        
        $scope.modal.loader = true;
        // GET ALL DATA ON THE BASE
        genericService.handler(pathDevice,getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.devices = data;
                $scope.modal.loader = null;
            }
        });
    };
    
    // FILTERS
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        
        filter.list = true;
        filter.search = $scope.filter.search;
        filter.active = $scope.filter.active;
        filter.ref = true;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }
        
        return filter;

    }

    // ADD DEVICE 
    $scope.add = function (device) {
        
        if ($scope.modal.loader) {
            return false;
        }
        
        $scope.modal.loader = true;
        device.save = true;
        
        // associate customer and device
        device.customer =
        {
            id: $scope.customer._id,
            name: $scope.customer.firstname + ' ' + $scope.customer.lastname 
        }

        genericService.handler(pathDevice,device).then(function (data) {
            
            if (checkMessage(data)) {

                $scope.modal.loader = null;
                $(searchDeviceModal).modal('hide');

                getScope(deviceModal).show($scope.customer);
            }
            
        });

    };
});

dbox.controller('genericModal', function ($scope, genericService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE CUSTOMER
        if (ac == 'deleteUser') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            genericService.handler(pathCustomer, keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    
                    getScope("container").rSearch();
                    $scope.modal = null;
                }
            });
        } else if (ac == 'deleteAssDevice') {
            var device = $scope.modal.obj.device;
            device.customer = null;
            device.save = true;
            genericService.handler(pathDevice,device).then(function (data) {
                
                if (checkMessage(data)) {
                    $scope.modal.loader = null;
                    modelAlertClose();
                    getScope(deviceModal).show($scope.modal.obj.customer);
                }
            
            });

        }
    };

});

dbox.controller('customerModalController', function ($scope, genericService) {
    $scope.customer = null;
    $scope.old_scope = null;
    $scope.countries = getCountries();
    $scope.languages = getLanguages();
    
    $scope.toggleSelection = function toggleSelection(id) {
        
        // IF LANGUAGE DOESN'T EXIST, ADD AN EMPTY ARRAY
        if ($scope.customer.language == undefined)
            $scope.customer.language = [];
        
        var index = $scope.customer.language.indexOf(id);
        
        if ($scope.customer.language[index] == undefined) {
            
            $scope.customer.language.push(id);
        }
        else {
            $scope.customer.language.splice(index, 1);
        }
        
    };
    
    // SAVE OR EDIT OBJECT
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.customer.loader = true;
            $scope.customer.save = true;
            
            genericService.handler(pathCustomer, $scope.customer).then(function (data) {
                
                if (checkMessage(data)) {
                    $scope.customer.loader = null;
                    listUser();
                }

            });

        }
    };
    
    var listUser = function () {

        $(customerModal).modal('hide');
        getScope("container").rSearch();

    }
    
    var setAddress = function(){
        
        if(!$scope.customer.address){
            $scope.customer.address = {};
        }
        
        $scope.customer.address.number = $("#street_number").val();
        $scope.customer.address.street = $("#route").val();
        $scope.customer.address.city = $("#locality").val();
        $scope.customer.address.state = $("#administrative_area_level_1").val();
        $scope.customer.address.zipcode = $("#postal_code").val();
        $scope.customer.address.country = $("#country").val();
        
    }
    
    var validation = function () {
        
        var error = '';
        delete $scope.customer.error;
        
        setAddress();
        
        if (isNullorEmpty($scope.customer.firstname))
            error += errorTemplate('First name');
        if (isNullorEmpty($scope.customer.lastname))
            error += errorTemplate('Last name');
        
        
        if (isNullorEmpty($scope.customer.mail)) {
            error += errorTemplate('E-mail');
        }
        else if (!validateEmail($scope.customer.mail))
            error += errorTemplate('E-mail');
        
        if ($scope.customer.language == undefined || $scope.customer.language.length == 0)
            error += errorTemplate('At least one language');

        if (isNullorEmpty($scope.customer.status))
            error += errorTemplate('Status');
            
        if($scope.customer.address){
            
            if (isNullorEmpty($scope.customer.address.street)) {
                error += errorTemplate('Street(Address)');
            }
            if (isNullorEmpty($scope.customer.address.number)) {
                error += errorTemplate('Number(Address)');
            }
            if (isNullorEmpty($scope.customer.address.zipcode)) {
                error += errorTemplate('Zip Code(Address)');
            }
            if (isNullorEmpty($scope.customer.address.city)) {
                error += errorTemplate('City(Address)');
            }
            if (isNullorEmpty($scope.customer.address.state)) {
                error += errorTemplate('State(Address)');
            }
            if (isNullorEmpty($scope.customer.address.country)) {
                error += errorTemplate('Country(Address)');
            }
        }
        else{
            error += errorTemplate('Address');
        }
        
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.customer, $scope.old_scope))
            error += errorTemplate('No changes to save');
      
        if ($.trim(error) != "") {
            scrollTop();
            $scope.customer.error = error;
            return false;
        }
        else{
            $scope.customer.error = null;
            return true;
        }
    };
});