
var shoutBox = (function () {

        var personName = "Unknown";

        function randomPersonName() {
            var a = ["Small", "Blue", "Fatty", "Pink"];
            var b = ["Bear", "Potato", "Banana", "Kiwi"];

            var rA = Math.floor(Math.random()*a.length);
            var rB = Math.floor(Math.random()*b.length);

            return a[rA] + b[rB];
        }
 
        function init() {
            //First verify that the user is connected to DSS or relay init
            if ($rootScope.appConfig === undefined || $rootScope.appConfig.loggedIn === false) {
                setTimeout(function () {
                    init();
                }, 5000);
                return false;
            }
            console.log('shoutBox module loaded');

            //Onload
            $(function() {
                $(".shoutbox").show();

                //toggle hide/show shoutbox
                $(".shoutbox__header").on("click",function (e) {
                    //get CSS display state of .shoutbox__body element
                    var toggleState = $('.shoutbox__body').css('display');

                    //toggle show/hide shoutbox__body
                    $('.shoutbox__body').slideToggle(200);
                   
                    //use toggleState var to change close/open icon image
                    if(toggleState == 'block') {
                        $(".shoutbox__header div").attr('class', 'open_btn');
                    } else {
                        $(".shoutbox__header div").attr('class', 'close_btn');
                    }
                });

                //trigger when user hits enter key
                $("#shoutbox__new_message").keypress(function(evt) {
                    if(evt.which == 13) {
                            var message = $(this).val();
                            sendMessage(message);
                            $(this).val('');
                        }
                });

                //register name
                personName = $rootScope.appConfig.login || randomPersonName();
            });
        }
 
        function displayMessage(from, message) {
            var time = new Date().toLocaleTimeString().toString();

            $('.shoutbox__messages').append('<div class="shoutbox__message"><span class="time">'+time+'</span><span class="name">'+from+'</span>'+message+'</div>').children(':last').hide().fadeIn();

            var scrolltoh = $('.shoutbox__messages')[0].scrollHeight;
            $('.shoutbox__messages').scrollTop(scrolltoh);
        }
  
        function sendMessage(message){
            displayMessage(personName, message);
            Notification.broadcastToOtherSessions('shoutbox-receive-message',{from:personName,message:message});
        }

        Notification.registerEvent('shoutbox-receive-message',function(evt, data) {
            console.log(data);
            displayMessage(data.from, data.message);
        });
 
        // Reveal public pointers to
        // private functions and properties
 
       return {
            init: init
        };
 
    })();
 
shoutBox.init();


