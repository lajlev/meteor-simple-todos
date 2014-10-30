// Create DB collection
Tasks = new Mongo.Collection("tasks")

if (Meteor.isClient) {
  Meteor.subscribe('tasks')

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
      Meteor.call('addTask', text)
      
      // Clear and prevent default behavior
      event.target.text.value = ""
      return false
    },

    'click .hide-completed': function() {
      Session.set("hideCompleted", ! Session.get("hideCompleted") )
    }

  }) /// body.events

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId()
    }
  })

  Template.task.events({
    'click .toggle-checked': function () {
      Meteor.call('setChecked', this._id, ! this.checked)
    },
    'click .delete': function () {
      Meteor.call('deleteTask', this._id)
    },
    'click .toggle-private': function () {
      Meteor.call('setPrivate', this._id, ! this.private)
    }
  }) /// task.events

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  })
} /// isClient

Meteor.methods({
  addTask: function(text) {
    if ( ! Meteor.userId() ) {
      throw new Meteor.Error("Not-authorized")
    }
    
    Tasks.insert({
      text: text, 
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    })
  },
  deleteTask: function(taskId) {
    var task = Tasks.findOne(taskId)
    if (task.private && task.owner !== Meteor.userId() ) {
      throw new Meteor.Meteor.Error("not-authorized")
    }

    Tasks.remove(taskId)
  },
  setChecked: function(taskId, setChecked) {
    var task = Tasks.findOne(taskId)
    if (task.private && task.owner !== Meteor.userId() ) {
      throw new Meteor.Meteor.Error("not-authorized")
    }
    
    Tasks.update(taskId, { $set: { checked: setChecked } })
  },
  setPrivate: function(taskId, setToPrivate) {
    var task = Tasks.findOne(taskId)
    if ( task.owner !== Meteor.userId() ) {
      throw new Meteor.Error("not-authorized")
    }
    Tasks.update(taskId, { $set: { private: setToPrivate } })
  }
})

if (Meteor.isServer) {
  Meteor.publish('tasks', function() {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    })
  })
}



