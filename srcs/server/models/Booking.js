const STATUS_ENUM = ["Paid", "Confirmed", "Pending"]

let BookingModel = {
	Reason:
	{
	  title:
	  [
		{
		  text:
		  {
			content: '',
		  },
		},
	  ],
	},

	Attachment:
	{
	  url : ""
	},

	Name :
	{
		rich_text :
		[
			{
				type : "text",
				text : {content : ""}
			}
		]
	},

	Email : 
	{
		email : ""
	},

	Contact:
	{
		phone_number : ""
	},
	
	Status:
	{
		select: {}
	},

	SuggestedDate:
	{
		date:
		{
			start : "",
			end : null
		}
	},

	ConfirmedDate:
	{
		date:
		{
			start : "",
			end : null
		}
	}
}

let Booking = {
	model : BookingModel,

	get getReason () {return this.model.Reason.title[0].text.content},
	get getAttachment () {return this.model.Attachment.url},
	get getName () {return this.model.Name.rich_text[0].text.content},
	get getEmail () {return this.model.Email.email},
	get getContact () {return this.model.Contact.phone_number},
	get getStatus () {return this.model.Status.select},
	get getSuggestedDate () {return this.model.SuggestedDate.date.start},
	get getConfimedDate () {return this.model.ConfirmedDate.date.start},

	set setReason (value) {this.model.Reason.title[0].text.content = value},
	set setAttachment (value) {this.model.Attachment.url = value},
	set setName(value) {this.model.Name.rich_text[0].text.content = value},
	set setEmail (value) {this.model.Email.email = value},
	set setContact (value) {this.model.Contact.phone_number = value},
	set setStatus (value) {this.model.Status.select = value},
	set setSuggestedDate (value) {this.model.SuggestedDate.date.start = value},
	set setConfimedDate (value) {this.model.ConfirmedDate.date.start = value},

	STATUS_ENUM
}

module.exports = Booking;