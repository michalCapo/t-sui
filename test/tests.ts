import test from 'node:test';
import assert from 'node:assert/strict';

import {
    Div,
    Span,
    Button,
    Input,
    Ul,
    Li,
    SVG,
    El,
    If,
    Or,
    Map,
    JS,
    Notify,
    Redirect,
    SetTitle,
    RemoveEl,
    SetText,
    AddClass,
    RemoveClass,
    Show,
    Hide,
    NewResponse,
} from '../ui';

function expectContains(got: string, want: string) {
    assert.ok(got.includes(want), `expected output to contain ${JSON.stringify(want)}\nGot: ${got}`);
}

function expectNotContains(got: string, want: string) {
    assert.ok(!got.includes(want), `expected output to not contain ${JSON.stringify(want)}\nGot: ${got}`);
}

test('basic node creation', () => {
    const js = Div('flex gap-4').ID('root').Text('hello').ToJS();
    expectContains(js, "document.createElement('div')");
    expectContains(js, ".id='root'");
    expectContains(js, ".className='flex gap-4'");
    expectContains(js, ".textContent='hello'");
    expectContains(js, 'document.body.appendChild(');
});

test('render children and skip nils', () => {
    const js = Div('parent').ID('parent').Render(
        Span('child-1').Text('first'),
        undefined,
        Span('child-2').Text('second'),
    ).ToJS();

    assert.equal((js.match(/document\.createElement/g) || []).length, 3);
    expectContains(js, 'appendChild(e1)');
    expectContains(js, 'appendChild(e2)');
});

test('attributes, styles, onclick and collect', () => {
    const js = Input()
        .Attr('type', 'text')
        .Attr('name', 'username')
        .Style('color', 'red')
        .OnClick({ Name: 'form.submit', Data: { count: 0 }, Collect: ['f-name', 'f-email'] })
        .ToJS();

    expectContains(js, "setAttribute('type','text')");
    expectContains(js, "setAttribute('name','username')");
    expectContains(js, ".style['color']='red'");
    expectContains(js, "addEventListener('click'");
    expectContains(js, "__ws.call('form.submit'");
    expectContains(js, '["f-name","f-email"]');
    expectContains(js, '"count":0');
});

test('client-side JS action', () => {
    const js = Button().OnClick(JS("history.back()")).ToJS();
    expectContains(js, "addEventListener('click'");
    expectContains(js, 'history.back()');
    expectNotContains(js, '__ws.call(');
});

test('If, Or, Map helpers', () => {
    const show = true;
    const ifJs = Div().Render(
        If(show, Span().Text('shown')),
        If(!show, Span().Text('hidden')),
    ).ToJS();
    expectContains(ifJs, "'shown'");
    expectNotContains(ifJs, "'hidden'");

    const orJs = Or(false, Span('ok').Text('active'), Span('bad').Text('inactive')).ToJS();
    expectContains(orJs, "'inactive'");
    expectContains(orJs, 'bad');

    const listJs = Ul().Render(...Map(['Apple', 'Banana', 'Cherry'], (item, i) => Li().ID(`item-${i}`).Text(item))).ToJS();
    expectContains(listJs, 'item-0');
    expectContains(listJs, "'Cherry'");
});

test('swap modes', () => {
    const n = Div().ID('new-counter').Text('42');
    expectContains(n.ToJSReplace('old-counter'), "getElementById('old-counter')");
    expectContains(n.ToJSReplace('old-counter'), 'replaceWith(');
    expectContains(n.ToJSAppend('list'), "getElementById('list')");
    expectContains(n.ToJSAppend('list'), '_p.appendChild(');
    expectContains(n.ToJSPrepend('list'), '_p.prepend(');
    expectContains(n.ToJSInner('container'), "getElementById('container')");
    expectContains(n.ToJSInner('container'), "_t.innerHTML=''");
});

test('helper JS functions', () => {
    expectContains(Notify('success', 'Saved!'), "'Saved!'");
    expectContains(Notify('success', 'Saved!'), '#16a34a');
    expectContains(Notify('success', 'Saved!'), '__messages__');
    expectContains(Redirect('/dashboard'), "window.location.href='/dashboard'");
    expectContains(SetTitle('New Title'), "document.title='New Title'");
    expectContains(RemoveEl('old-item'), "getElementById('old-item')");
    expectContains(SetText('counter', '42'), "e.textContent='42'");
    expectContains(AddClass('btn', 'active'), "classList.add('active')");
    expectContains(RemoveClass('btn', 'active'), "classList.remove('active')");
    expectContains(Show('panel'), "classList.remove('hidden')");
    expectContains(Hide('panel'), "classList.add('hidden')");
});

test('response builder', () => {
    const js = NewResponse()
        .Replace('content', Div().ID('new-content').Text('Updated'))
        .Toast('success', 'Done!')
        .Build();

    expectContains(js, 'replaceWith(');
    expectContains(js, "'Done!'");
    expectContains(js, '__messages__');
});

test('escaping and deferred rawJS', () => {
    const escaped = Span().Text("it's a test\nline2").ToJS();
    expectContains(escaped, "it\\'s a test\\nline2");

    const deferred = Div().ID('container').JS("document.getElementById('container').dataset.ready='1';").ToJS();
    const appendIdx = deferred.indexOf('document.body.appendChild(');
    const rawIdx = deferred.indexOf("document.getElementById('container').dataset.ready='1'");
    assert.ok(appendIdx >= 0);
    assert.ok(rawIdx > appendIdx);
    expectContains(deferred, '.call(e0)');
});

test('svg uses createElementNS', () => {
    const js = SVG('w-6 h-6')
        .Attr('viewBox', '0 0 24 24')
        .Render(El('path').Attr('d', 'M0 0L10 10'), El('circle').Attr('cx', '5'))
        .ToJS();

    expectContains(js, "createElementNS('http://www.w3.org/2000/svg','svg')");
    expectContains(js, "createElementNS('http://www.w3.org/2000/svg','path')");
    expectContains(js, "createElementNS('http://www.w3.org/2000/svg','circle')");
    expectContains(js, "setAttribute('class','w-6 h-6')");
    expectNotContains(js, ".className='w-6 h-6'");
});
