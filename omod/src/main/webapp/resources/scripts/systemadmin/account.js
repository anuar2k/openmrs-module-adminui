var personAccount;
var userAccount;
var providerAccount;
var addUserAccount;
var addProviderAccount;
var messages;
var contextPath;

jq(function(){
    jq('input.confirm').click(function(){

        if (!jq(this).attr("disabled")) {

            var password = jq("#user1_password").val();
            var confirmPassword = jq("#user1_confirmPassword").val();

            if (confirmPassword && password != confirmPassword) {
                emr.errorAlert("error.password.match");
                return;
            }

            jq(this).closest("form").submit();
        }

        jq(this).attr('disabled', 'disabled');
        jq(this).addClass("disabled");

    });
});

function initAccountDetails(p, u, pr, addUser, addProvider, messagesMap){
    personAccount = p;
    userAccount = u;
    providerAccount = pr;
    addUserAccount = addUser;
    addProviderAccount = addProvider;
    messages = messagesMap;
}

angular.module('accountService', ['ngResource','uicommons.common'])
    .factory('Account', function($resource) {
        var url = "/"+contextPath +"/adminui/systemadmin/accounts/accountDetails/getAuditInfo.action?uuid=:uuid";
        return $resource(url, {
            uuid: '@uuid'
        },{});
    });

angular.module("adminui.createAccount", ["adminui.should-match"])

    .controller("AccountController", ["$scope",
        function($scope){
            $scope.addUserAccount = addUserAccount;
            $scope.addProviderAccount = addProviderAccount;
            $scope.person = personAccount;
            $scope.uuidUserMap = {};
            //The way the ng-model attributes are set up in userFormFields.gsp, the model
            //name is uuidUserMap[''] since this is a new account and suer uuid is blank
            $scope.uuidUserMap[''] = userAccount;
            $scope.uuidProviderMap = {};
            $scope.uuidProviderMap[''] = providerAccount;
        }
    ]);

angular.module("adminui.accountAuditInfo", ["accountService", "ngSanitize"])

    .controller("AccountAuditInfoController", ["$scope", "Account",
        function($scope, Account) {
            $scope.$on('event.auditInfo.changed', function(){
                Account.get({uuid: $scope.personUuid}).$promise.then(function(auditInfo){

                    if(auditInfo.changedBy || auditInfo.dateChanged){
                        var msg = messages["changedByOn"];
                        var changedBy = '';
                        var dateChanged = '';
                        if(auditInfo.changedBy) {
                            changedBy = auditInfo.changedBy;
                        }
                        if(auditInfo.dateChanged) {
                            dateChanged = auditInfo.dateChanged;
                        }
                        $scope.changeAuditInfo = msg.replace("{0}", changedBy).replace("{1}", dateChanged);
                    }
                }, function(){
                    emr.errorAlert(messages['auditInfoFail']);
                });
            });
        }
    ]);

