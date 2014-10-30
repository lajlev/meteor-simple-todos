// Create DB collection
Tasks = new Mongo.Collection("tasks")

// If client side
if (Meteor.isClient) {

  // Fetch tasks from DB
  Template.body.helpers({
    tasks: function() {
      return Tasks
        .find( {}, {sort: {createdAt: -1} } )
    }
  }) //// body.helpers

  Template.body.events({
    'submit .new-task': function (event) {
      
      // Fetch value
      var text = event.target.text.value
      
      // Insert in DB
      Tasks.insert({
        text: text,
        createdAt: new Date()
      })
      
      // Clear and prevent default behavior
      event.target.text.value = ""
      return false
    }
  }) //// body.events

  Template.task.events({
    'click .toggle-checked': function () {
      Tasks.update(this._id, {$set: {checked: ! this.checked} } )
    },
    'click .delete': function () {
      Tasks.remove(this._id)
    }
  }) //// task.events

}