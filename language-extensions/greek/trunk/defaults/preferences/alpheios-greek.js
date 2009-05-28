pref("extensions.alpheios.greek.usemhttpd", true);
pref("extensions.alpheios.greek.chromepkg","alpheios-greek");
pref("extensions.alpheios.greek.languagecode","grc");
pref("extensions.alpheios.greek.base_unit","word");
pref("extensions.alpheios.greek.methods.startup",'loadShortDefs,loadLexIds,loadStripper');
pref("extensions.alpheios.greek.methods.convert",'greek_to_ascii');
pref("extensions.alpheios.greek.methods.lexicon",'webservice');
pref("extensions.alpheios.greek.url.lexicon", 'http://localhost:8200');
pref("extensions.alpheios.greek.url.lexicon.request", "/greek?word=<WORD>");
pref("extensions.alpheios.greek.url.lexicon.timeout",5000);
pref("extensions.alpheios.greek.popuptrigger",'mousemove');
pref("extensions.alpheios.greek.url.grammar",
     "chrome://alpheios-greek/content/alph-greek-grammar.xul");
pref("extensions.alpheios.greek.grammar.hotlinks",
     "alph-decl,alph-pofs,alph-mood,alph-case,alph-voice,alph-pers,alph-tense");
pref("extensions.alpheios.greek.features.alpheios-grammar",true);
pref("extensions.alpheios.greek.features.alpheios-inflect",true);
pref("extensions.alpheios.greek.context_handler","grammarContext");
pref("extensions.alpheios.greek.panels.use.defaults",true);
pref("extensions.alpheios.greek.dictionaries.full","lsj,aut");
pref("extensions.alpheios.greek.dictionaries.short","aut,lsj,ml");
pref("extensions.alpheios.greek.dictionaries.short.default","lsj");
pref("extensions.alpheios.greek.dictionaries.full.default","lsj");
pref("extensions.alpheios.greek.dictionary.full.lsj.search.lemma_url",
     "http://dev.alpheios.net:8800/exist/rest/db/xq/lexi-lemma2html.xq?");
pref("extensions.alpheios.greek.dictionary.full.lsj.search.lemma_param",
     "l");
pref("extensions.alpheios.greek.dictionary.full.lsj.search.multiple_lemmas"
    ,false);
pref("extensions.alpheios.greek.dictionary.full.lsj.search.id_url",
     "http://dev.alpheios.net:8800/exist/rest/db/xq/lexi-id2html.xq?");
pref("extensions.alpheios.greek.dictionary.full.lsj.search.lemma_id_param",
     "n");
pref("extensions.alpheios.greek.dictionary.full.lsj.search.multiple_lemma_ids"
    ,false);
pref("extensions.alpheios.greek.dictionary.full.aut.search.lemma_url",
     "http://dev.alpheios.net:8800/exist/rest/db/xq/lexi-lemma2html.xq?");
pref("extensions.alpheios.greek.dictionary.full.aut.search.lemma_param",
     "l");
pref("extensions.alpheios.greek.dictionary.full.aut.search.multiple_lemmas"
    ,false);
pref("extensions.alpheios.greek.dictionary.full.aut.search.id_url",
     "http://dev.alpheios.net:8800/exist/rest/db/xq/lexi-id2html.xq?");
pref("extensions.alpheios.greek.dictionary.full.aut.search.lemma_id_param",
     "n");
pref("extensions.alpheios.greek.dictionary.full.aut.search.multiple_lemma_ids"
    ,false);