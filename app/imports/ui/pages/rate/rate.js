import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Profiles } from '/imports/api/profile/ProfileCollection';
import { Interests } from '/imports/api/interest/InterestCollection';

const displaySuccessMessage = 'displaySuccessMessage';
const displayErrorMessages = 'displayErrorMessages';

export const dayObjects = [{ label: 'Monday', value: '7' },
                          { label: 'Tuesday', value: '6' },
                          { label: 'Wednesday', value: '5' },
                          { label: 'Thursday', value: '4' },
                          { label: 'Friday', value: '3' },
                          { label: 'Saturday', value: '2' },
                          { label: 'Sunday', value: '1' }];
export const timeObjects = [{ label: '1', value: '7' },
                          { label: '2', value: '6' },
                          { label: '3', value: '5' },
                          { label: '4', value: '4' },
                          { label: '5', value: '3' },
                          { label: '6', value: '2' },
                          { label: '7', value: '1' }];

Template.Rate_Page.onCreated(function onCreated() {
  this.subscribe(Interests.getPublicationName());
  this.subscribe(Profiles.getPublicationName());
  this.messageFlags = new ReactiveDict();
  this.messageFlags.set(displaySuccessMessage, false);
  this.messageFlags.set(displayErrorMessages, false);
  this.context = Profiles.getSchema().namedContext('Profile_Page');
});

Template.Rate_Page.helpers({
  successClass() {
    return Template.instance().messageFlags.get(displaySuccessMessage) ? 'success' : '';
  },
  displaySuccessMessage() {
    return Template.instance().messageFlags.get(displaySuccessMessage);
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },
  profile() {
    return Profiles.findDoc(FlowRouter.getParam('username'));
  },
  interests() {
    const profile = Profiles.findDoc(FlowRouter.getParam('username'));
    const selectedInterests = profile.interests;
    return profile && _.map(Interests.findAll(),
        function makeInterestObject(interest) {
          return { label: interest.name, selected: _.contains(selectedInterests, interest.name) };
        });
  },
  day() {
    return dayObjects;
  },
  time() {
    return timeObjects;
  },
});


Template.Rate_Page.events({
  'submit .profile-data-form'(event, instance) {
    event.preventDefault();
    const day = event.target.Day.value;
    const time = event.target.Last.value;
    const username = FlowRouter.getParam('username'); // schema requires username.
    const updatedProfileData = { day, time, username };
    // Clear out any old validation errors.
    instance.context.reset();
    // Invoke clean so that updatedProfileData reflects what will be inserted.
    const cleanData = Profiles.getSchema().clean(updatedProfileData);
    // Determine validity.
    instance.context.validate(cleanData);

    if (instance.context.isValid()) {
      const docID = Profiles.findDoc(FlowRouter.getParam('username'))._id;
      const id = Profiles.update(docID, { $set: cleanData });
      instance.messageFlags.set(displaySuccessMessage, id);
      instance.messageFlags.set(displayErrorMessages, false);
    } else {
      instance.messageFlags.set(displaySuccessMessage, false);
      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});

