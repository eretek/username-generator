/*! Eretek Online Araçlar #29 — AD ve Microsoft 365 Kullanıcı Adı Üretici */
ERT.def('29', {
	run: function (v, c) {
		var dom = String(v.domain || '').trim().toLowerCase().replace(/^@/, '');
		if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(dom)) { throw c.fe('domain', 'badDomain'); }
		var tr = function (s) {
			s = String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr');
			var map = v.umlaut === 'de' ? { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' } : { 'ä': 'a', 'ö': 'o', 'ü': 'u', 'ß': 'ss' };
			s = s.replace(/[äöüß]/g, function (x) { return map[x]; }).replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ş/g, 's');
			return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
		};
		var taken = new Set();
		c.lines(v.existing || '', 50000, 'existing').forEach(function (l) { var x = l.split(/[;,\t]/)[0].trim().toLowerCase(); taken.add(x.split('@')[0]); });
		var tpl = function (t, f, l) { return t.replace('{first}', f).replace('{last}', l).replace('{f}', f[0] || '').replace('{l}', l[0] || ''); };
		var rows = [], cls = [], out = [];
		c.lines(v.staff, 20000, 'staff').forEach(function (line, i) {
			var p = line.split(/[;\t,]/).map(function (x) { return x.trim(); }).filter(Boolean), first, last;
			if (p.length >= 2) { first = p[0]; last = p[1]; } else { var w = line.trim().split(/\s+/); if (w.length < 2) { throw c.fe('staff', 'rowName', { r: i + 1 }); } last = w.pop(); first = w.join(' '); }
			var f = tr(first.split(/\s+/)[0]), l = tr(last.replace(/\s+/g, ''));
			if (!f || !l) { throw c.fe('staff', 'rowName', { r: i + 1 }); }
			var base = tpl(v.upnTpl, f, l), sBase = tpl(v.samTpl, f, l).slice(0, 20), u = base, s = sBase, n = 1, note = [];
			while (taken.has(u)) { n++; u = base + n; }
			var m = 1; while (taken.has(s) || (s !== u && taken.has(s))) { m++; s = sBase.slice(0, 20 - String(m).length) + m; }
			if (n > 1) { note.push(c.t('numbered', { n: n })); }
			if (sBase.length < tpl(v.samTpl, f, l).length) { note.push(c.t('trunc')); }
			taken.add(u); taken.add(s);
			rows.push([first, last, u + '@' + dom, s, u + '@' + dom, note.join('; ') || 'OK']); cls.push(note.length ? 'warn' : '');
			out.push(u + '@' + dom);
		});
		var cols = [c.t('c_first'), c.t('c_last'), 'userPrincipalName', 'sAMAccountName', 'mail', c.t('c_note')];
		return { big: c.t('big', { n: rows.length }), msgs: [['info', c.t('caseNote')], ['info', c.t('noWrite')]], tables: [{ cols: cols, rows: rows, cls: cls }], x: { csv: { name: 'usernames', cols: cols, rows: rows } }, v: { upns: out } };
	}
});
