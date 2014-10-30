// Create DB collection
Tasks = new Mongo.Collection("tasks")

if (Meteor.isClient) {

  // Fetch tasks from DB
  Template.body.helpers({
    tasks: function() {
      if ( Session.get("hideCompleted") ) {
        return Tasks.find( {checked: {$ne: true} }, {sort: {createdAt: -1} } )
      } else {
        return Tasks.find( {}, {sort: {createdAt: -1} } )
      }
    },
    incompletedCount: function () {
      return Tasks.find( { checked: {$ne: true} } ).count()
    }
  }) /// body.helpers

  Template.body.events({
    'submit .new-task': function (event) {
      
      // Fetch value
      var text = event.target.text.value
      
      // Insert in DB
      Tasks.insert({
        text: text,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username
      })
      
      // Clear and prevent default behavior
      event.target.text.value = ""
      return false
    },

    'click .hide-completed': function() {
      Session.set("hideCompleted", ! Session.get("hideCompleted") )
    }

  }) /// body.events

  Template.task.events({
    'click .toggle-checked': function () {
      Tasks.update(this._id, {$set: {checked: ! this.checked} } )
    },
    'click .delete': function () {
      Tasks.remove(this._id)
    }
  }) /// task.events

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  })
} /// isClient