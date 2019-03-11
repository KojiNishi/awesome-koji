const VERTICAL_TYPE = "Vertical";
const VERTICAL_ITEM_CLSNAME = "verticalItem";
const USECASE_TYPE = "UseCase";
const USECASE_ITEM_CLSNAME = "usecaseItem";

const VERTICAL_LIST = [
  {text:"Travel", value:"372495"},
  {text:"Food & Beverage", value:"372494"},
  {text:"Automotive", value:"373547"},
  {text:"Education", value:"373546"},
  {text:"CPG", value:"373548"},
  {text:"Government", value:"373549"},
  {text:"Nonprofit", value:"373550"},
  {text:"Other", value:"373551"}
];
const USECASE_LIST = [
  {text:"Widget", value:"372869"},
  {text:"Event Screen", value:"372870"},
  {text:"Email", value:"372871"},
  {text:"Advertising", value:"373553"},
  {text:"Commerce", value:"373554"},
  {text:"Competition", value:"373555"},
  {text:"GoConnect", value:"373556"},
  {text:"Rights", value:"373557"}
];

// Item class 
var Item = function(text,value,type){
  this.text = text;
  this.value = value;
  this.type = type;
}

var VerticalItem = function(text,value) {
  Item.call(this,text,value,VERTICAL_TYPE); 
}
var UseCaseItem = function(text,value){
  Item.call(this,text,value,USECASE_TYPE);
}

var Filter = function(){
  this.verticals = [];
  this.usecases = [];
};

Filter.prototype.getSelectedTagIds = function(){
  var ids = this.verticals.map((vertical) => {
    return vertical.value;
  }).join(',');

  ids = (ids !== "") ? ids+= "," : ids; 

  ids += this.usecases.map((usecases) => {
    return usecases.value;
  }).join(',');
  return ids;
};

Filter.prototype.getFilterItems = function(itemType){
  return (itemType === VERTICAL_TYPE) ? this.verticals : (itemType === USECASE_TYPE) ? this.usecases : null;
};

Filter.prototype.add = function(txt,val,type){
  var newItem;
  if(type === VERTICAL_TYPE){
    newItem = new VerticalItem(txt,val);
    this.verticals.push(newItem);
  }
  else if(type === USECASE_TYPE){
    newItem = new UseCaseItem(txt,val);
    this.usecases.push(newItem);
  }
};
Filter.prototype.removeAll = function(){
  this.verticals = [];
  this.usecases = [];
}
Filter.prototype.remove = function(val,type){
  var items = this.getFilterItems(type);
  var newItems = items.filter((i) => {
    return i.value != val;      
  });

  if(type === VERTICAL_TYPE) this.verticals = newItems;
  else if(type === USECASE_TYPE) this.usecases = newItems;
}

//
// not now but don't delete for future sake
//

// Filter.prototype.createItemHtml = function(){
//   if(!this.verticals.length && !this.usecases.length)
//     return "<div class='itemBlank'>Search...</div>";

//   var itemHtmls = "";
//   $.each(this.verticals,function(index,elem){
//     itemHtmls += `<div class='item ${VERTICAL_ITEM_CLSNAME}' onclick='filteredItemClick(this)' data-value='${elem.value}'>${elem.text}</div>`;
//   });
//   $.each(this.usecases,function(index,elem){
//     itemHtmls += `<div class='item ${USECASE_ITEM_CLSNAME}' onclick='filteredItemClick(this)' data-value='${elem.value}'>${elem.text}</div>`;
//   });

//   return itemHtmls;
// }

// Filter.prototype.showList = function(){
//   $("#conditions").empty();
//   $("#conditions").append(this.createItemHtml());
// };

// main code
var $filter = new Filter();
var $widgetId,$filterId;

$(document).ready(function(){
  initialize();

  $('.sortBy a').on('click', (e) =>{
    sortByClick($(e.target));
  });
  $('#txtSearch').keydown(function(e){
    if(e.keyCode === 9 || e.keyCode === 16) return;
    var txt = $(this)[0].value;
    searchWidgetByKeyword(txt);
  });

  $('#sidebar').on('change', '.searchVerticalItem, .searchUseCaseItem', (e) => {
    if($(e.target).hasClass("searchVerticalItem")){
      sideBarVerticalChange(e);
    }
    else if($(e.target).hasClass("searchUseCaseItem")){
      sideBarUsecaseChange(e);
    }
  });
});

function initialize(){
  this.$widgetId = $(".stackla-widget").attr("data-id");
  this.$filterId = $(".stackla-widget").attr("data-filter");
  $(".dropdown").find('.lblButton').html("Latest");

  this.createSideBarList();
  //$filter.showList();
}

function createSideBarList(){
  var sideBarHtml = this.getSectionHtml("Vertical",VERTICAL_LIST,"searchVerticalItem");
  sideBarHtml += this.getSectionHtml("Use Case",USECASE_LIST,"searchUseCaseItem");
  $('.sidebar_fieldset fieldset').append(sideBarHtml);
}

function getSectionHtml(title,list,clsName){
  var section= "<legend>" + title + "</legend>";
  $.each(list, function(idx,elem){
    section += createEachItem(clsName,elem.value,elem.text);
  });
  return section;
}

function createEachItem(clsName,val,txt){
  return `<label class="check_css"><input type="checkbox" class="${clsName}" value ="${val}" >${txt}</label>`;
}

//
// not now but don't delete for future sake
//

// function filteredItemClick(e){
//   var val = $(e).data('value');
//   var type, elems;

//   if($(e).hasClass(VERTICAL_ITEM_CLSNAME)){
//     type = VERTICAL_TYPE;
//     elems = $(".searchVerticalItem");
//   }
//   else if($(e).hasClass(USECASE_ITEM_CLSNAME)){
//     elems = $(".searchUseCaseItem");
//     type = USECASE_TYPE;
//   }

//   $filter.remove(val,type);

//   $.each(elems, function(idx,elem){
//     if(elem.value == val) elem.checked = !elem.checked;
//   })

//   $filter.showList();
//   this.changeWidgetFilter();
// }

function sideBarItemChange(e,type){
  var val = e.target.value;
  var txt = $(e.target).parent()[0].innerText;

  if($(e.target).is(':checked')){
    $(e.target).parent().addClass('checked');
    $filter.add(txt,val,type);
  }else{
    $(e.target).parent().removeClass('checked');
    $filter.remove(val,type); 
  }

  if(this.isSidebarAnyChecked){
    $("#txtSearch")[0].value = "";
  }

  //$filter.showList();
  this.changeWidgetFilter(this.$filterId);
}

function changeWidgetFilter(filterId,keyword = ""){
  var tagIds = $filter.getSelectedTagIds();
  filterId = (!filterId) ? this.$filterId : filterId;
  StacklaFluidWidget.search(this.$widgetId, keyword)
  StacklaFluidWidget.changeFilter(this.$widgetId,filterId, tagIds);
}

function searchWidgetByKeyword(keyword){
  $.each($(".sidebar_fieldset input"), function(idx,elem){
    $(elem).parent().removeClass('checked');
    elem.checked = false;
  })

  $filter.removeAll();
  this.changeWidgetFilter(this.$filterId,keyword);
}

function sortByClick(e){
  var filterId = e.attr("data-filter");
  e.parents(".dropdown").find('.lblButton').html(e.text());
  this.changeWidgetFilter(filterId);
}

function sideBarVerticalChange(e){
  sideBarItemChange(e,VERTICAL_TYPE);
}
function sideBarUsecaseChange(e){
  sideBarItemChange(e,USECASE_TYPE);
}

function isSidebarAnyChecked(){
  $.each($(".sidebar_fieldset input"), function(idx,elem){
    if(elem.checked) return true;
  })
  return false;
}