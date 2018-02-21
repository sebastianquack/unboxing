import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  
  if (Samples.find().count() == 0){
	  for (var i = 1; i<10; i++) {
  	  	Samples.insert({
  	  		_id: "id"+i,
  	  		name: "name "+i,
  	  		url: "url "+i
  	  	})	
  	  }
  }
  
});
