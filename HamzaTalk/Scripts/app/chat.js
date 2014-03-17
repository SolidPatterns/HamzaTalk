//function ChatViewModel(app, dataModel) {
//    var self = this;

//    // ChatViewModel currently does not require data binding, so there are no visible members.
//}

//app.addViewModel({
//    name: "Chat",
//    bindingMemberName: "chat",
//    factory: ChatViewModel
//});

function ChatViewModel(app, dataModel) {
    var self = this;

    function message(root, id, messageBody, messageFrom, messageTime) {
        var self = this;

        self.id = id;
        self.messageBody = ko.observable(messageBody);
        self.messageFrom = messageFrom;
        self.messageTime = messageTime;
    };

    self.addMessageBody = ko.observable("");
    self.messages = ko.observableArray();

    self.add = function(id, messageBody, messageFrom, messageTime) {
        self.messages.push(new message(self, id, messageBody, messageFrom, messageTime));
    };


    ko.bindingHandlers.returnAction = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());

            $(element).keydown(function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    value(viewModel);
                }
            });
        }
    };

    self.sendMessage = function () {
        $.ajax({
            url: "/api/chathub/post",
            data: { 'Message': self.addMessageBody() },
            type: "POST"
        });

        self.addMessageBody("");
    };
}

$(function () {

    var viewModel = new ChatViewModel(),
        hub = $.connection.chat;

    ko.applyBindings(viewModel);

    hub.client.addItem = function (item) {
        viewModel.add(item.Id, item.Message, item.UserName, item.SentTime);
    };

    //hub.deleteItem = function (id) {
    //    viewModel.remove(id);
    //};

    //hub.updateItem = function (item) {
    //    viewModel.update(item.ID, item.Title, item.Finished);
    //};

    $.connection.hub.start();

    $.get("/api/chat/Get", function (items) {
        $.each(items, function (idx, item) {
            viewModel.add(item.ID, item.Message, item.userName, item.SentTime);
        });
    }, "json");
});
