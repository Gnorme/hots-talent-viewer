
$('#newHero').click(function(){
	//$("#demo").hide();
	//$("#demo").animate({height: "toggle", opacity: "toggle"}, "medium");
	$("#newHero").hide();
	$("#taskForm").animate({
		height: "toggle", 
		opacity: "toggle"
		}, "medium", function(){
			
		});
});
$('#cancelHero').click(function(){
	$("#taskForm").animate({
		height: "toggle", 
		opacity: "toggle"
		}, "medium", function(){
			$("#newHero").show();
		});
});
$("#saveHero").click(function(){
	var task = {data:{
		name:$("#name").val(),
		description:$("#description").val(),
		due:$("#calendar").datepicker('getDate')
	}}
	$.ajax({
		type:"POST",
		url:"http://localhost:8080/tasks",
		contentType: "application/json",
		headers: {
			"Authorization": sessionStorage.getItem('token'),
		},	
		data: JSON.stringify(task),
		success: function(output){
			console.log(output);
			$("#taskForm").animate({height: "toggle", opacity: "toggle"}, "medium");
			$("#newTask").show();
			row = '';
			row += '<tr><td>' + output.data.createdby + '</td>';
			row += '<td>' + output.data.name + '</td>';
			row += '<td>' + output.data.description + '</td>';
			row += '<td>' + output.data.status + '</td>';
			row += '</tr>';
			$("#table > tbody:last-child").append(row);
		},
		error: function(exception){
			console.log(exception);
		}
	});
	//console.log(JSON.stringify(task));
});
$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

$('.login').click(function(){
	var user = {data:{
		email:$("#email").val(),
		password:$("#password").val()
	}}
	login(user);
});
$('.register').click(function(){
	var user = {data:{
		firstname:$("#firstname").val(),
		lastname:$("#lastname").val(),
		email:$("#reg-email").val(),
		password:$("#reg-password").val()
	}}
	$.ajax({
		type:"POST",
		url:"http://localhost:8080/register",
		contentType: "application/json",
		data: JSON.stringify(user),
		success: function(output){
			console.log(output);
			user = {data:{
				email:$("#reg-email").val(),
				password:$("#reg-password").val()			
			}}
			login(user);
		},
		error: function(exception){
			console.log(exception);
			message = exception.responseJSON.data.message
			error = exception.responseJSON.data.error
			if (error.includes("Password")) {
				$("#RegEmailLab").css({'color': '#4CAF50'});
				$("#RegEmailLab").text("Email");	
				$("#RegPassLab").css({'color': 'red'});
				$("#RegPassLab").text(message);		
			}
			if (error.includes("Email")) {
				$("#RegEmailLab").css({'color': 'red'});
				$("#RegEmailLab").text(message);	
			}

		}
	});
});
function login(user) {
	$.ajax({
		type:"POST",
		url:"http://localhost:8080/login",
		contentType: "application/json",
		data: JSON.stringify(user),
		success: function(output){
			console.log(output);
			sessionStorage.setItem("token",output.data.token);
			console.log(sessionStorage.token);
			$.ajax({
				type:"GET",
				contentType: "application/json",
				url:"http://localhost:8080/talents",
				headers: {
					"Authorization": sessionStorage.getItem('token'),
				},
				success: function(output){
					console.log(output)
					$(".login-page").hide()
					$("#demo").show()
					row = '';
					for(var i in output.data){
						row += '<tr><td id="hero"><p>' + output.data[i].Hero+ '</p></td>';
						row += '<td id="level"><p>' + output.data[i].Level + '</p></td>';
						if (output.data[i].Talents[0]) {
							row += '<td><p>'
							for (var a in output.data[i].Talents){
								row += output.data[i].Talents[a].Name + ' ';
							}
							row += '</p></td>';
						} else {
							row += '<td></td>'
						}	
						if (output.data[i].Keyholes == null){
							row += '<td><p>null</p></td>';							
						} else if (output.data[i].Keyholes[0] == undefined){
							row += '<td><p>undefined</p></td>';	
						} else {
							row += '<td><p>[' + output.data[i].Keyholes[0] + '] , ['+output.data[i].Keyholes[1]+']</p></td>';
						}
						row += '</tr>';
						//row += '<tr><td colspan="4"><div class="form"><form id="girisyap">';
						row += '<tr><td colspan="4">'
						//div = '<div class="form-group">'
						//label = '<label class="control-label" for="inputNormal">'
						//input = '<input value="" id="name" class="bp-suggestions form-control" cols="50" rows="10" ></input>'
						delIcon = '<img onclick="remove(event)" src="x-mark.png" height="12" width="12" style="opacity:0.5; margin-right:10px"/>'
						editIcon = '<img onclick="edit(event)" src="editing-edit-icon.png" height="12" width="12" style="opacity:0.5; margin-right:10px"/>'
						for (var b in output.data[i].Talents){
							//row += div+label+output.data[i].Talents[b].Name+'</label>'+input+'</div>'
							row += '<p>'+delIcon+editIcon+'<span>'+output.data[i].Talents[b].Name + '</span>: <span>' + output.data[i].Talents[b].Description + '</span></p>';
						}						
						row += '</td></tr>';
					}
					//$(row).appendTo('table');
					$("#table > tbody:last-child").append(row);
					//$("td[colspan=4]").find("p").hide();
					$("td[colspan=4]").hide();
					//$('.form-control').on('focus blur', function (e) {
					//		$(this).parents('.form-group').toggleClass('focused', (e.type === 'focus' || this.value.length > 0));
					//	}).trigger('blur');
				}
			});
		},
		error: function(exception){
			$("#LogPassLab").css({'color': 'red'})
			$("#LogPassLab").text('Password - Incorrect')
			$("#LogEmailLab").css({'color': 'red'})
			$("#LogEmailLab").text('Email - Incorrect')
			if (exception.responseJSON.data){
				console.log(exception.responseJSON.data.message);
			} else {
				console.log(exception)
			}
		}		
	});
}
function closeModal(){
	$('#newDescription').val("");	
	$('#myModal').hide();
}
function remove(event){
	var $target = $(event.target)
	console.log($target.closest("p"))
	console.log($target.closest("p")[0].innerText)
}
function edit(event){
	var $target = $(event.target);
	var talentName = $target.closest("span").context.nextElementSibling.innerText;
	$('#newDescription').val($target.closest("span").context.nextElementSibling.nextElementSibling.innerHTML)
	$("#talentName").text(talentName) 
	$("#myModal").show();
	document.getElementById('saveEdit').onclick = function(){
		var hero = $target.closest("tr").prev().find("#hero").text()
		var level = $target.closest("tr").prev().find("#level").text()
		var talent = {data:{
			name:talentName,
			keys:[[],[]],
			description:$('#newDescription').val()
		}}
		$.ajax({
			type:"PUT",
			url:"http://localhost:8080/edit/"+hero+"/"+level,
			contentType: "application/json",
			headers: {
				"Authorization": sessionStorage.getItem('token'),
			},
			data: JSON.stringify(talent),
			success: function(output){
				console.log(output);
			},
			error: function(exception){
				console.log(exception);
			}
		});
		$target.closest("span").context.nextElementSibling.nextElementSibling.innerText = $('#newDescription').val();
		$('#myModal').hide();
		$('#newDescription').val("")	
	}
	$('#talentName').text(talentName);
}