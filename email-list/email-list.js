Polymer({
      is: 'email-list',
      properties: {
        source: {
          type: Array,
          value: () => {
            return [];
          }
        },
        externals: {
          type: Array,
          value: () => {
            return [];
          }
        },
        smtp:{
          type:String,
          value:'smtp.gmail.com'
        },
        port:{
          type:Number,
          value:465
        },
        chartResponse:{
          notify: true
        },
        mailObj:{
          type:Object
        }        
      },
      behaviors: [
        PolymerD3.chartDataManagerBehavior
      ],
      listeners: {
        'dragstart': 'drag'
      },
      drop: function(e){
        e.preventDefault();
        var getData = e.dataTransfer.getData('text');
        if(getData){
          var extractData = getData.split('@:');
          var nodeText = extractData[0];
          var nodeIndex = extractData[1];
          e.target.classList.remove('hover');
          e.target.innerHTML += '<span class="tags" readonly="readonly" data-index="'+nodeIndex+'" contenteditable="false">'+nodeText+'</span>';
          e.dataTransfer.clearData();
        }
      },
      showConfig: function(){
        this.$.dialog.open();
      },
      sendMail: function(){
        var mailCode="";
        var toArray = Array.from(this.$.mailTo.children).map(function(data){return data.dataset.index});
        this.mailObj={
          to: this.$.mailTo.innerHTML.replace('&nbsp;',' '),
          subject: this.$.mailSubject.innerHTML.replace('&nbsp;',' '),
          content: this.$.mailContent.innerHTML.replace('&nbsp;',' ')
        };

        var emailArray=[];
        this.source.forEach((data,index)=> emailArray.push(this.emailCode(index)));

        mailCode+=`
        %python
        import smtplib
        server=smtplib.SMTP_SSL("`+this.smtp+`","`+this.port+`")
        server.login('`+this.useremail+`','`+this.password+`')
        email=`+JSON.stringify(emailArray)+`
        from_address='`+this.useremail+`'
        for i in range(len(email)):
          to_address=[email[i]["to"]]
          msg = ("From: %s\\r\\nSubject:%s\\r\\nTo: %s\\r\\n\\r\\n"
                % (from_address, email[i]["subject"],", ".join(to_address)))
          msg+=email[i]["content"]
          server.sendmail(from_address, to_address, msg)
        server.quit()
        `;
        this.chartResponse = {
          response:mailCode,
          type:'email-list'
        };
        this.$.dialog.close();
      },
      emailCode: function(i){
        var emailObj = Object.assign({},this.mailObj);
        Object.keys(emailObj).forEach(data=> {
          emailObj[data]= emailObj[data].replace(/<span.+?data-index="(.+?)".+?<\/span>/g,function(index,el,match){
            return this.source[i][match]
          }.bind(this,i));
        });
        return emailObj;
      },
      drag: function(e){
          if(!e.target.dataset) return;
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text",e.target.dataset.target+"@:"+e.target.dataset.index);
      },
      dragLeave: function(e){
        e.target.classList.remove('hover');
      },
      allowDrop: function(e){
        e.target.classList.add('hover');
        e.preventDefault();
      },
      draw: function() {
      }
    });
