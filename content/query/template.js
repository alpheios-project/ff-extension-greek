/**
 * @fileoverview Greek specific implementation of the interactive query template 
 * functionality. 
 * @version $Id$
 *
 * Copyright 2008-2009 Cantus Foundation
 * http://alpheios.net
 * 
 * This file is part of Alpheios.
 *
 * Alpheios is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alpheios is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Morpheus is from Perseus Digital Library http://www.perseus.tufts.edu
 * and is licensed under the Mozilla Public License 1.1. 
 * You should have received a copy of the MPL 1.1
 * along with this program. If not, see http://www.mozilla.org/MPL/MPL-1.1.html.
 * 
 * The Smyth Grammar and LSJ Meanings come from the Perseus Digital Library
 * They are licensed under Creative Commons NonCommercial ShareAlike 3.0
 * License http://creativecommons.org/licenses/by-nc-sa/3.0/us
 */

/**
 * @ignore
 */
var TEMPLATE =
{
    verb:
          { data_file: "alph-infl-verb-paradigms.xml",
            xslt_file: "alph-infl-paradigm.xsl",
            css_file: "alph-infl-paradigm.css",
            load_data_on_start: true,
            invalidate_empty_cells: false,
            xslt_params: this.getVerbParams,
            add_form_if_missing: false,
                        /* table columns */
            cols: {},
            filters: [
            ],

    },
    noun:
          { data_file: "alph-infl-noun.xml",
            xslt_file: "alph-infl-substantive-query.xsl",
            xslt_params: this.getNounParams,
            load_data_on_start: true,
            exclude_test: this.missing_decl,
            invalidate_empty_cells: false,
            add_form_if_missing: true,

            /* table columns */
            cols: {},
            filters: [
            ]
          },
    adjective:
          { data_file: "alph-infl-adjective.xml",
            xslt_file: "alph-infl-substantive-query.xsl",
            xslt_params: this.getAdjParams,
            load_data_on_start: true,
            exclude_test: this.missing_decl,
            invalidate_empty_cells: false,
            add_form_if_missing: true,

            /* table columns */
            cols: {}, 
            filters: [
            ],
          }
    /**
     * article query template - not yet working
     *    
     * article:
     *    { data_file: "alph-infl-article.xml",
     *       xslt_file: "alph-infl-substantive-query.xsl",
     *       load_data_on_start: true,
     *       invalidate_empty_cells: false,
     *       xslt_params: this.getArticleParams,
     *       add_form_if_missing: true,
     * 
     *       cols: {}, 
     *       filters: [
     *       ],
     *     }
     */

};
Components.utils.import("resource://alpheios-greek/alpheios-convert-greek.jsm",TEMPLATE);
TEMPLATE.d_converter = new TEMPLATE.ConvertGreek();

/**
 * @ignore
 * make the inflection query element
 * @param {Element} a_elem the DOM node to which the query element is appended
 * @param {String} a_pofs the part of speech for the query
 * @param {Element} a_ans the object containing the correct inflection data
 * @param {Function} a_callback callback function to be called when the correct
 *                              answer is found
 * @returns true if able to create the inflection query element, otherwise false
 * @type Boolean   
 */
function makeInflQuery(a_elem,a_pofs,a_ans,a_callback)
{
    var template = TEMPLATE[a_pofs];
    if (typeof template == "undefined")
    {
        return false;
    }
    
    if (typeof template.exclude_test == 'function' && template.exclude_test(a_ans))
    {
        return false;
    }
    var infl_table;
    if (template.load_data_on_start)
    {
        var xslt_params = template.xslt_params(a_ans);
        infl_table = activateTable(a_elem,a_ans,template,a_callback,xslt_params);
    }
    
    if ($(".paradigm-nomatch",infl_table).length > 0)
    {
        $("#alph-infl-table",a_elem).remove();
        return false;
    }

    if (typeof template.css_file == "string")
    {
        var css_file_url = Alph.BrowserUtils.getStyleUrl() + '/' + template.css_file;
        $("head",$(a_elem).get(0).ownerDocument).append(
            '<link type="text/css" rel="stylesheet" href="' + css_file_url + '"/>');
    }
    
    var html = '<div class="query-table">\n<div class="query-cols">\n';    

    // col headers
    for (var a_col in template.cols)
    {
        if (template.cols.hasOwnProperty(a_col))
        {
            var attname = a_col;
            var att_list;
            if (typeof template.cols[a_col] == 'function')
            {
                att_list = template.cols[a_col]();
            }
            else 
            {
                att_list = template.cols[a_col].match(/,(.*?)(?=,)/g);
                
            }
            if (att_list.length > 0)
            {                
                var div = 
                    '<div class="query-col" context="' + attname + '">\n' +
                    '<div class="query-col-header">' + getString(attname)  + '</div>\n';
                att_list.forEach(
                    function(a_att)
                    {
                        a_att = a_att.replace(/,/,'');
                        div = div +
                            '<label class="choice" context="' + a_att + '">' +
                            '<input type="radio" name="' + attname + 
                            '"  value="' + a_att + '"/>' + 
                            '<span class="attribute">'  +
                            getString(a_att,"full.").replace(/_/,' ') + 
                            '</span></label><br/>\n';
                            
                    }
                );
                div = div + '</div>\n';
                html = html + div;
            }
        }
    }
    
    html = html + "</div>";
   
    var buttons = '<div class="buttons"><button id="reset" class="alpheios-button">reset</button></div>';
    html = html + '<div class="query-decl"/>' + buttons + '</div>';
    $(a_elem).append(html);
    
    var bind_data = 
    {
        answer:a_ans,
        base_elem: a_elem,
        template: template,
        callback:a_callback
    };
    
    $(".choice",a_elem).hover(
        toggleChoiceHover,
        toggleChoiceHover
    );
    $(".choice input",a_elem).bind('click',bind_data,checkAnswer);
    $("#alph-infl-table",a_elem).remove();
    
    $(".query-decl",a_elem).append(infl_table);
   
    $("#reset",a_elem).bind('click',bind_data,resetTable);
         
    return true;
}

/**
 * @ignore
 * reset the inflection query table clearing any answers found so far
 * @param {Event} a_event the reset button click event 
 */
function resetTable(a_event)
{
    $("#alph-infl-table .showform",a_event.data.base_elem).removeClass("showform");
    $("#alph-infl-table .correct",a_event.data.base_elem).removeClass("correct");
    $("#alph-infl-table .incorrect",a_event.data.base_elem).removeClass("incorrect");
    $("#alph-infl-table .matchingform",a_event.data.base_elem).removeClass("matchingform");
    $("#alph-infl-table .invalid",a_event.data.base_elem).removeClass("invalid");
    $(".query-col .correct",a_event.data.base_elem).removeClass("correct");
    $(".query-col .incorrect",a_event.data.base_elem).removeClass("incorrect");
    
    $(".query-col input",a_event.data.base_elem).each(
        function()
        {
            $(this).attr("checked",false);
        }
    );  
}

/**
 * @ignore
 * activate the inflection table element
 * @param {Element} a_elem the DOM node to which the query table is appended
 * @param {Element} a_ans the object containing the correct inflection details
 * @param {Object} a_tepmlate the table template data
 * @param {Function} a_callback callback executed upon correct answer selected
 * @param {Object} a_xslt_param optional xslt parameters 
 * @returns {Element} the inflection table element
 */
function activateTable(a_elem,a_ans,a_template,a_callback,a_xslt_param)
{
    var xslt_proc = Alph.BrowserUtils.getXsltProcessor(a_template.xslt_file);
    var data_file_url = Alph.BrowserUtils.getContentUrl(a_ans.lang_tool.getLanguage()) + '/inflections/'
        + a_template.data_file;
    var decl_table = loadForms(data_file_url, xslt_proc, a_xslt_param);
    var table_elem = decl_table.getElementById("alph-infl-table") 
    $(a_elem).get(0).ownerDocument.importNode(table_elem,true);
    $(table_elem).tableHover({colClass: "",
                              rowClass: "",
                              headCols: true,
                              allowHead: false});
    this.hideEmptyCols(table_elem);
    
    // set the radio button selection options 
    // to match what is shown on the inflection table
 
    $("th",table_elem).each(
        function()
        {
            if ($(this).css("display") != 'none')
            {
                var att_name = $(this).attr("context");
                if ($(this).attr("alph-"+att_name))
                {
                    var att_val_list = $(this).attr("alph-"+att_name);
                    att_val_list = att_val_list.replace(/^\|/,'');
                    att_val_list = att_val_list.replace(/\|$/,'');
                    var att_values = att_val_list.split(/\s|,|\|/);
                    if ( typeof a_template.cols[att_name] == "undefined")
                    {
                        a_template.cols[att_name] = ',';
                        att_values.forEach(
                            function(a_val)
                            {
                                 a_template.cols[att_name] = 
                                     a_template.cols[att_name] + a_val + ',';
                            }
                        ); 
                    }
                    else 
                    {
                        att_values.forEach(
                            function(a_val)
                            {
                                var pattern = new RegExp(',' + a_val + ',');
                                 if ( pattern.exec(a_template.cols[att_name]) ==  null)
                                 {
        
                                    a_template.cols[att_name] = 
                                        a_template.cols[att_name] + a_val + ',';
                                 }
                            }
                        ); 
                        
                    }
                }
                replaceString(this);                
                $(this)
                    .hover(toggleHeadHover,toggleHeadHover)
                    .one('click',selectHeadCell);
            }        
        }
    );
    
    $("th span",table_elem).each(
        function()
        {
            replaceString(this);        
        }
    );
    
    $("td.ending-group",table_elem)
        .hover(toggleCellHover,toggleCellHover)
        .bind('click',{ answer: a_ans,
                        template: a_template,
                        callback: a_callback}, showTableForm);

    if (a_template.invalidate_empty_cells)
    {
        // invalidate any empty cells
        $("td.ending-group",table_elem).each(
            function()
            {
                if ($(".ending",this).length == 0)
                {
                    $(this).addClass("invalid");
                }
            }
        );
    }
    
    var num_cols = $("col",table_elem).length;
    var width = ((1/num_cols)*100).toFixed(0);
    $("td",table_elem).css("width",width+'%');
    $("th",table_elem).css("width",width+'%');
        
    // iterate through the incorrect choices so far, updating the table to gray out the
    // incorrect selections
    $(".query-col .choice.incorrect",a_elem).each(
        function()
        {
            markCellIncorrect(this,table_elem.ownerDocument);
        }
    );
    
    return table_elem;
    
}

/**
 * @ignore
 */
function markCellIncorrect(a_choice,a_doc)
{
    var att_name = $("input",a_choice).attr('name') ; 
    var regex = 'alph-' + att_name +
        ' *= |'+ $("input",a_choice).attr("value") + '|';

    // iterate through the table cells which contain the selected
    // value in the corresponding alph- attribute
    $("#alph-infl-table *[" + regex + "]",a_doc).each
    (
        function()
        {
            // alph- attributes may be multi-valued, so only 
            // mark the cell incorrect if all possible values for the
            // cell have beeen identified as being incorrect
            var possible = 
                $(this).attr('alph-'+att_name)
                    .match(/\|(.*?)(?=\|)/g);
            var num_incorrect = $(this).attr("incorrect-"+att_name) || 0; 
            if ((num_incorrect + 1) == possible.length)
            {
                $(this).addClass("incorrect");
            }
            else
            {
                $(this).attr("incorrect-"+att_name,num_incorrect+1);
            }
        }
    );
}
/**
 * @ignore
 * Checks user input
 * @param {Event} a_event the user input event
 */
function checkAnswer(a_event)
{
    
    var filters = a_event.data.template.filters;
    
    var parent_doc = this.ownerDocument;
    var parent_tbl = $(this).parents('div.query-table').get(0);
    var all_cols = $('.query-col',parent_tbl);
    var num_cols = $(all_cols).length;
    var parent_col = $(this).parents('div.query-col').get(0);
    var selected_name = this.getAttribute('name');
    var selected_val = this.getAttribute('value');
    var ans_vals = a_event.data.answer.attributes['alph-'+ selected_name].split(/\|/);
    var matched_val = ''
    for (var i=0; i<ans_vals.length;i++)
    {
        if (selected_val == ans_vals[i])
        {
            matched_val=selected_val;
            break;
        }
    }
    if (matched_val != '')
    {
        // if the table isn't already activated check to
        // see if we should now show it
        if ( $("#alph-infl-table",parent_doc).length == 0)
        {
            a_event.data.template.cols.forEach(
                function(a_tcol)
                {
                    // if this is a filtering attribute,
                    // activate the table
                    if (a_tcol[0] == selected_name &&
                        typeof a_tcol[2] == 'object')
                    {
                        activateTable(
                            a_event.data.base_elem,
                            a_event.data.answer,
                            a_event.data.template,
                            a_event.data.callback,
                            $.extend(
                                { filter_by: selected_name + '=' + selected_val
                                  
                                },a_tcol[2])
                         );
                    }
                }
            );
        }
        
        $(this).parent('.choice').addClass("correct").siblings(".choice").each(
            function()
            {
                $(this).addClass("incorrect");
                markCellIncorrect(this,parent_doc);
            }
        );
        
        $(this).unbind('click',checkAnswer);
        
        $(parent_col).siblings('.query-col').each(
            function()
            {
                var col = this;
                var other_att = $(this).attr('context');
        
                // iterate through the filters, and if we find one which 
                // has a matching pair of attributes, invalidate the cell
                for (var i=0; i<filters.length; i++)
                {
                    if (
                        filters[i][other_att] &&
                        filters[i][selected_name] && 
                        filters[i][selected_name]==selected_val
                        )
                    {
                       $(".choice input[value='" + filters[i][other_att] + "']",col)
                                    .parent('.choice').addClass("invalid");
                    }
                }
            }
            

            
        );
    }
    else
    {
        $(this).parent('.choice').addClass("incorrect");
        markCellIncorrect($(this).parent('.choice'),parent_doc);        
    }
    $(all_cols).each(
            function()
            {
                var auto_correct = $(".choice:not('.invalid'):not('.incorrect')",this);
                
                // if there's only one possible choice left for a column,
                // auto-select it
                if ($(auto_correct).length == 1)
                {
                    var selected = autoSelectAnswer(this,a_event.data);                    
                }
            }
    );
    var num_correct = $(".choice.correct",parent_tbl).length;
    // if we have only one column remaining, we can show 
    // on the next select
    if ((num_cols - num_correct) == 1)
    {
        $(".choice input",parent_tbl).one('click',a_event.data,showForm);
        
    }
    // if all the answers are found, show all the forms in the table
    if (num_cols ==  num_correct)
    {
        showAllForms(parent_doc,a_event);
        // only execute the callback once per query
        if (typeof a_event.data.callback_executed == "undefined")
        {
            a_event.data.callback_executed = true;
             a_event.data.callback();
        }
    }
}

/**
 * @ignore
 * Show a form identified by user input
 * @param {Event} a_event the user input event
 */
function showForm(event)
{
    var a_elem = this;
    var parent_col = $(a_elem).parents('div.query-col').get(0);
    var selected_att= $(parent_col).attr('context');
    
    var parent_doc = a_elem.ownerDocument;
    
    var a_ans = event.data.answer.attributes;
    var att_names = [];
    $(parent_col).siblings(".query-col").each(
        function()
        {
            
            att_names.push($(this).attr('context'));
        }
    );
    var xpath = '[alph-' + selected_att + '*= |' + $(a_elem).attr('value') + '|]';
    att_names.forEach(
        function(a_att)
        {
            var value = a_ans['alph-' + a_att];
            xpath = 
                xpath + 
                '[alph-' + a_att + '*= |' + value + '|]';
        }
    );
    var cell = $("#alph-infl-table td.ending-group" + xpath + " .ending",parent_doc).get(0);
    showTableForm({data:event.data},cell);        
}

/**
 * @ignore
 * load the inflection form data
 * @param {String} a_file the url to the xml file containing the data
 * @param {String} a_xslt_proc the xslt processor
 * @param {Object} a_xslt_param optional xslt transform parameters
 */
function loadForms(a_file,a_xslt_proc,a_xslt_param)
{
        var formXML = document.implementation.createDocument("", "", null);
        formXML.async = false;
        formXML.load(a_file);
                
        if (typeof a_xslt_param != "undefined")
        {
            for (var param in a_xslt_param)
            {
                a_xslt_proc.setParameter("",param,a_xslt_param[param]);
            }
        }
        var formHTML = '';
        try
        {
            // add the xslt parameters
            formHTML = a_xslt_proc.transformToDocument(formXML);
        }
        catch(a_e)
        {
            alert(a_e);
        }
        return formHTML;
}

/**
 * @ignore
 * replace a string from properties
 * @param {Element} a_elem the DOM node containing the text to be replaced
 */
function replaceString(a_elem,a_props)
{
    var newtext = this.getString($(a_elem).text());
    $(a_elem).text(newtext);
}

/**
 * @ignore
 * get a string from properties
 */
function getString(a_text,a_prefix)
{
    a_text = jQuery.trim(a_text);
    var newtext = ''; 
    if (a_prefix)
    try 
    {
        newtext = $("#alph-infl-strings").get(0).getString(a_prefix + a_text);
    }
    catch(a_e) {}
    if (newtext == '')
    {
        try
        {
            newtext = $("#alph-infl-strings").get(0).getString(a_text);
        }
    
        catch(e)
        {
            // try splitting into multiple strings
            if (a_text.match(/\s+/))
            {
                var replaced = [];
                try 
                { 
                    a_text.split(/\s+/).forEach(
                        function(a_str)
                        {
                                replaced.push(
                                    $("#alph-infl-strings").get(0).getString(a_str));             
                        }
                    );
                    newtext = replaced.join(' ');
                 }
                catch(a_e)
                {
                    // quietly ignore errors retrieving strings not found in properties
                }
            }
        }
    }
    if (newtext != '')
    {
        a_text = newtext;      
    }
    
    return a_text;
}

/**
 * @ignore
 * Show all the forms in the inflection table
 * @param {Document} a_doc the parent document
 * @param {Event} a_event the event which initated the action
 */
function showAllForms(a_doc,a_event)
{
    $("#alph-infl-table .ending",a_doc).each(
        function()
        {
            showTableForm(a_event,this);    
        }
    );
}

/**
 * @ignore
 * Show a specific form in the inflection table - may be in response
 * to a user click on the cell, or selection of the correct answer
 * by process of elimination
 * @param {Event} a_event the event which initiated the action
 * @param {Element} a_cell the DOM node containing the form
 */
function showTableForm(a_event,a_cell)
{
    // if a_cell is null, then called from an event handler
    if (a_cell == null) {
        a_cell = $(".ending",this).get(0);
    }
                
    var must_match = 0;
    var matched = 0;
    
    var parent_cell = $(a_cell).parent('td').get(0);
    for(var k=0; k<parent_cell.attributes.length; k++)
    {
        var a_att = parent_cell.attributes[k];
        if (a_att.name.indexOf('alph-') == 0)
        {
            var ans_key = a_att.name;
            // only check attributes which are actually defined in the answer
            if (typeof a_event.data.answer.attributes[ans_key] != "undefined")
            {
             
                must_match++;
                // split the value of the cell on |, dropping off the leading
                // and trailing |s so we don't get empty strings
                var cell_values = 
                    a_att.value
                         .replace(/^\|/,'')
                         .replace(/\|$/,'')
                         .split(/\|/);
                var ans_values = a_event.data.answer.attributes[ans_key].split(/\|/); 
                var found_value = false;
                CELL_LOOP:
                for (var i=0; i<cell_values.length; i++)
                {
                    ANS_LOOP:
                    for (var j=0; j<ans_values.length; j++)
                    {
                        if (cell_values[i] == ans_values[j])
                        {
                            found_value = true;
                            break CELL_LOOP;
                        }
                    }
                }
                if (found_value)
                {
                    matched++;
                }
            }
        }
    }   
    
    
    $(a_cell).addClass("showform");
    var pofs = 
        $(".alph-infl-set .alph-pofs", a_event.data.src_node).attr("context") ||
        $(".alph-dict .alph-pofs", a_event.data.src_node).attr("context");

    // if it's a match, indicate that it's correct, and show the rest of the forms
    // hack for verb particples to check the pofs too
    if (matched == must_match && 
        (!$(parent_cell).attr("alph-pofs") || $(parent_cell).attr("alph-pofs") == pofs ))
    {
        $(parent_cell).addClass("correct");
        // mark the header cells correct
        $(parent_cell).prevAll('th').addClass("correct");
        var cell_index = parent_cell.realIndex;              
        $("tr[id^=headerrow] th",parent_cell.ownerDocument).each(
            function()
            {
                var realIndex = this.realIndex;
                var colspan;
                var id = $(this).parent("tr").attr("id");
                try 
                {
                    colspan = parseInt($(this).attr("colspan"));
                }
                catch(e)
                {
                    colspan = 1;
                }
                if (typeof realIndex != "undefined" && 
                    (realIndex == cell_index
                    || (cell_index > realIndex && cell_index < (realIndex + colspan))))
                {
                    $(this).addClass("correct");            
                }
            }
        );
        // add the ending to the correct cell if it's not already there
        var found_form = false
        var ending = convertForm(a_event.data,a_event.data.answer.ending);
        if (a_event.data.template.add_form_if_missing)
        {
            $(a_cell).siblings('.ending').andSelf().each(
                function()
                {
                    // if we're passed a conversion function, convert cell data before
                    // comparing with supplied form
                    var form = convertForm(a_event.data,$(this).text()); 
                    if (form == ending )
                    {
                        found_form = true;
                    }
                }
            );
            if (! found_form)
            {
                $(a_cell).parent('td').children('.ending').eq(0).addClass('notfirst');
                $(a_cell).parent('td')
                         .prepend('<span class="ending">'+a_event.data.answer.ending + '</span>');
            }
        }
        var tables = [];
        tables.push($(a_cell).parents('table').get(0));
        tables.push($(a_cell).parents('table').siblings('table').get());
        
        // show all the remaining forms in all inflection tables in the display
        tables.forEach(
            function(a_table)
            {
                $(".ending",a_table).each(
                    function()
                    {
                        $(this).addClass("showform");
                        if (convertForm(a_event.data,$(this).text()) == ending)
                        {
                            $(this).addClass('matchingform');
                        }
                    }
                );
                $('td:not(.correct)',a_table).addClass("incorrect");
                $('th:not(.correct)',a_table).addClass("incorrect");
            }
        );
        var parent_doc = a_cell.ownerDocument;
        $(".query-col",parent_doc).each(
            function()
            {
                autoSelectAnswer(this,a_event.data);
            }
        );
        $("#reset",parent_doc).css("display","none");
         
        var answer_terms = [];
        for (var prop in a_event.data.answer.attributes)
        {
            if (prop.match(/^alph-/) && a_event.data.answer.attributes[prop] != '' )
            {
                answer_terms.push(a_event.data.answer.attributes[prop]);
            }
        }
        // only execute the callback once per query
        if (typeof a_event.data.callback_executed == "undefined")
        {
            a_event.data.callback_executed = true;
            a_event.data.callback();
        }
    }
    else
    {
        $(a_cell).parent('td').addClass("incorrect");
        var ending = convertForm(a_event.data,a_event.data.answer.ending);
        $(a_cell).siblings('ending').andSelf().each
        (            
            function()
            {
                $(this).addClass("showform");

                var form = convertForm(a_event.data,$(this).text());
                if (form == ending )
                {
                    $(this).addClass('matchingform');
                }
            }
        );

    }
    
}

/**
 * @ignore
 * toggle the hover class over an inflection table cell
 * @param {Event} a_event the hover event
 */
function toggleCellHover(a_event)
{
    $(this).toggleClass("hovered");
}


/** 
 * @ignore
 * hover the corresponding table header when hovering over a radio choice
 * @param {Event} a_event the hover event
 */
function toggleChoiceHover(a_event)
{
    var att_name = $("input",this).attr('name') ;
    var regex = 'alph-' + att_name +
        ' *= |'+ $("input",this).attr("value") + '|';

    // iterate through the table cells which contain the selected
    // value in the corresponding alph- attribute
    $("#alph-infl-table th[" + regex + "]",this.ownerDocument).toggleClass("hovered");
}

/**
 * @ignore
 * toggle the hover class over an inflection table heading
 * @param {Event} a_event the hover event
 */
function toggleHeadHover(a_event)
{
    var elem = this;
    var context = $(elem).attr("context");
    if (! context)
    {
        return;
    }
    var values = $(elem).attr("alph-" + context);
    var value_list = [];
    var match;
    if (match = values.match(/\|(.*?)\|$/))
    {
        value_list = match[1].split(/\|+/); 
    }
    else
    {
        value_list.push(values);    
    }
    value_list.forEach(
        function(a_v)
        {
            var col_select = $('input[name=' + context + '][value=' + a_v +']',
                elem.ownerDocument);
            if (col_select.length > 0)
            {
                // hover the corresponding radio element if any
                $(col_select).parent().toggleClass("hovered");
                        
            }
        }
    );
    $(elem).toggleClass("hovered");
         
}

/**
 * @ignore
 * respond to a click on an inflection table heading
 * @param {Event} a_event the click event
 */
function selectHeadCell(a_event)
{
    var elem = this;
    var context = $(elem).attr("context");
    if (! context)
    {
        return;
    }
    var values = $(elem).attr("alph-" + context);
    var value_list = [];
    var match;
    if (match = values.match(/\|(.*?)\|$/))
    {
        value_list = match[1].split(/\|+/); 
    }
    else
    {
        value_list.push(values);    
    }
    value_list.forEach(
        function(a_v)
        {
            var col_select = $('input[name=' + context + '][value=' + a_v+']',elem.ownerDocument);
            if (col_select.length > 0)
            {
                $(col_select).click();
            }
        }
    );
}


/**
 * @ignore
 * auto-select an answer (because only one option left due to
 * process of elmination)
 * @param {Element} a_col the DOM element containing the set of data for which the answer
 *                        is to be selected
 * @param {Object} a_data the object containing the correct inflection data  
 */
function autoSelectAnswer(a_col,a_data)
{
    var col_name = $(a_col).attr('context').replace(/_/," ");
    var answer = a_data.answer.attributes['alph-'+col_name];
    var selector = $("[value='"+answer+"']",a_col);
    if (selector.length == 1)
    {
        $(selector).attr("checked",true);
        $(selector).parent('.choice').addClass('correct')
                   .siblings('.choice').addClass('incorrect');
        $(selector).unbind('click',checkAnswer);
        $(a_col).siblings('.query-col').each(
            function()
            { 
                var col = this;
                var other_att = $(this).attr('context');
        
                // iterate through the filters, and if we find one which 
                // has a matching pair of attributes, invalidate the cell
                for (var i=0; i<a_data.template.filters.length; i++)
                {
                    if (
                            a_data.template.filters[i][other_att] &&
                            a_data.template.filters[i][col_name] && 
                            a_data.template.filters[i][col_name]==answer
                        )
                    {
                        $(".choice input[value='" + a_data.template.filters[i][other_att] + "']",col)
                        .parent('.choice').addClass("invalid");
                    }
                }
            }
        );
        return $(selector).get(0);
    }
    return null;
}

/**
 * @ignore
 */
function getVerbParams(a_ans)
{
    var params = {};
    params.e_selectedEndings = [ $(".alph-entry",a_ans.src_node).get(0) ];
    params.e_form = a_ans.form;
    params.e_fragment = 1;
    params.e_matchPofs = 'verb'
    params.e_queryMode = true;
    return params;
}

/**
 * @ignore
 */
function getArticleParams(a_ans)
{
    return { e_group1: 'case',
             e_group4: 'gend',
             e_group5: 'num'};     
}

/**
 * @ignore
 */
function getNounParams(a_ans)
{
    var params = { e_group1: 'case',
                   e_group4: 'num',
                   e_group5: 'gend'};
    var declension = a_ans.attributes['alph-decl'];
    if (declension)
    {
        params.e_decl = declension;
    }
    return params;
}

/**
 * @ignore
 */
function getAdjParams(a_ans)
{
    var params = { e_group1: 'case',
                   e_group4: 'num',
                   e_group5: 'gend'};
    var declension = a_ans.attributes['alph-decl'];
    if (declension)
    {
        params.e_decl = declension.replace(/_adjective/,'');
    }
    return params;
}

/**
 * @ignore
 */
function missing_decl(a_ans)
{
    var declension = a_ans.attributes['alph-decl'];
    return (typeof declension == 'undefined' || declension == ''); 
}

/**
 * @ignore
 */
function hideEmptyCols(a_tbl)
{
    var data_rows = $("tr.data-row",a_tbl).length;
    var empty_cols = [];
    // iterate through the columns, hiding any which are completely empty
    $('col',a_tbl).each (
          function() {
            var index = $(this).attr("realIndex");
            var num_empty = $("td[realIndex='" + index + "'] span.emptycell",a_tbl).length;
            if (num_empty == data_rows) 
            {
                empty_cols.push(index);    
            }
  
          }
    );

    var reduce_cols = {headerrow1: {},
                       headerrow2: {}};
    empty_cols.forEach( 
        function(a_o, a_i)
        {
            $("td[realIndex='" + a_o + "']",a_tbl).css("display","none");
                
            $("tr[id^=headerrow] th",a_tbl).each(
                function()
                {
                    var realIndex = this.realIndex;
                    var colspan;
                    var id = $(this).parent("tr").attr("id");
                    try 
                    {
                        colspan = parseInt($(this).attr("colspan"));
                    }
                    catch(e)
                    {
                    }
                    
                    if (typeof realIndex != "undefined" && 
                        (realIndex == a_o
                          || (a_o > realIndex && a_o < (realIndex + colspan))))
                    {
                        if (typeof reduce_cols[id][realIndex] == "undefined")
                        {
                            reduce_cols[id][realIndex] = 1;
                        }
                        else
                        {
                            reduce_cols[id][realIndex] = reduce_cols[id][realIndex] + 1;    
                        }
                        
                    }
                }
            );
        }
    );
    for (var id in reduce_cols)
    {
        if (id.substring("headerrow") == -1)
        {
            continue;
        }
        for (var colindex in reduce_cols[id])
        {
            if (typeof reduce_cols[id][colindex] == "number")
            {
                var col_header = 
                    $("tr#" + id + " th[realIndex='" + colindex + "']",a_tbl)
                    .get(0);
                var col_span = parseInt(col_header.getAttribute("colspan"));
                if (reduce_cols[id][colindex] == col_span)
                {
                    $(col_header).css("display","none");
                }
                else
                {
                    col_header.setAttribute("colspan",col_span - reduce_cols[id][colindex]);
                    col_header.setAttribute("origColspan",col_span);
                }
            }
        }
    }
    
}

/**
 * @ignore
 */
function convertForm(a_data,a_text)
{
    if (a_text.match(/^[-_]$/))
    {
        return a_text;
    }
    else
    {
        return TEMPLATE.d_converter.normalizeGreek(a_text,true,'\/^_=');
    } 
}
