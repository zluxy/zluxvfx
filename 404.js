(function() {
    var repo = 'docs-ru', lang = '';
    $('title').text('Запрашиваемая страница не найдена');

    $DOC.onload(function() {
        $DOC.cbody
            .add('form404:div`mar20')
                ._add('h1', 'Запрашиваемая страница не найдена!')
                ._add('hr')
                ._add('h3', 'Вы можете создать новую страницу по этому адресу')
                ._add('create:bootstrap.Button`martop5', 'Добавить страницу', function(btn) {
                    btn.listen('click', function() {
                        PubSettings();
                    });
                })
                .createElement($DOC.sections['fixed-top-bar'], 3);
    });
    
    function githubCommitSuccess() {
        $DOC.cbody.form404
            .deleteAll()
            .remove();
        $DOC.cbody
            .add('github_commit:div`mar20')
                ._add('h1', 'Новая страница успешно создана!')
                ._add('hr')
                ._add('h3', 'Через некоторое время (обычно это не больше минуты) новая страница станет доступна в браузере и вы сможете ее отредактировать')
                .createElement($DOC.sections['fixed-top-bar'], 3);
        var recheck = function() {
            $.get(location.href, function(data) { window.location = location.href + (location.href.indexOf('?edit') >= 0 ? '' : '?edit'); });
        };
        setInterval(recheck, 25000);
        setTimeout(recheck, 10000);
        setTimeout(recheck, 15000);
    }
    
    function PubSettings() {
        var _this = this;
        var modal = $DOC.cbody.add(githubSettingsModalForm());
            modal.createElement();
        modal.user.value = location.host.split('.')[0];  
        modal.repo.value = decodeURIComponent(location.pathname).split('/')[1];
        modal.branch.value = 'gh-pages';
        var apikey = modal.apikey.value = sessionStorage.getItem('github-apikey') || '';
            
        var // /repo/path
            names = getMwFileName({fileName:decodeURIComponent(location.pathname).split('/').slice(2).join('/')});
        modal.path.value = names.fileName;
        
        
        
        modal.ok.listen('click', function() {
            if (modal.apikey.value !== apikey) {
                apikey = modal.apikey.value;
                sessionStorage.setItem('github-apikey', apikey);
            }
            
            $.get('/' + repo + (lang ? ('/' + lang) : '') + '/page_template.html', function(data) {
                
                // document and root path replace in page template
                data = data.split('</head>');
                var add_depth = location.pathname.split('/').length - 3;
                
                var root = '';
                for(var i = 1; i < add_depth; i++)
                    root += '../';
                root = 'root="' + root + '"';
                if (!lang) add_depth--;
                var path = '';
                for(var i = 0; i < add_depth; i++)
                    path += '../';
                path = 'src="' + path + 'document.min.js"';
                data[0] = data[0]
                    .replace(/src\s?=\s?["'](\.\.\/)?document(\.min)?\.js["']/, path)
                    .replace(/root\s?=\s?["'].*?["']/, root);
                data = data.join('</head>');
                
                if (modal.user.value && modal.repo.value && modal.branch.value && modal.path.value && apikey) {
                    
                    var githubapi = new window.github_api({
                        username: modal.user.value,
                        password: apikey,
                        auth: "basic"
                    });

                    var repo = githubapi.getRepo(modal.user.value, modal.repo.value);
                    repo.write(modal.branch.value, names.fileName, data, '---', function(err) {
                        if (err) console.log(err);
                        else {
                            close();
                            githubCommitSuccess();
                        }
                    });
                }
            });
              
        });
        modal.cancel.listen('click', close);
        modal.close.listen('click', close);
        function close() {
            $(modal.element).modal('hide');
            setTimeout(function() {
                modal.deleteAll();
                modal.remove();
            }, 0);
        }
        
        $(modal.element).modal('show');
        
        
        function githubSettingsModalForm() {
            var modal = controls.create('bootstrap.modal', {style:'z-index:1200;'});
            modal.close = modal.header.add('button`close', '&times;', {type:'button'});
            modal.header.add('h4`modal-title', 'Publish on GitHub');
            var form = modal.body.add('form:bootstrap.Form');
            form
                ._add('bootstrap.FormGroup', function(grp) {
                    grp.add('bootstrap.ControlLabel', 'Username:');
                    modal.user = grp.add('bootstrap.ControlInput');
                })
                ._add('bootstrap.FormGroup', function(grp) {
                    grp._add('bootstrap.ControlLabel', 'Repository:');
                    modal.repo = grp.add('bootstrap.ControlInput');
                })
                ._add('bootstrap.FormGroup', function(grp) {
                    grp._add('bootstrap.ControlLabel', 'Branch:');
                    modal.branch = grp.add('bootstrap.ControlInput');
                })
                ._add('bootstrap.FormGroup', function(grp) {
                    grp._add('bootstrap.ControlLabel', 'Path in repository:');
                    modal.path = grp.add('bootstrap.ControlInput');
                })
                ._add('bootstrap.FormGroup', function(grp) {
                    grp._add('bootstrap.ControlLabel', 'Personal access token or password:');
                    modal.apikey = grp.add('bootstrap.ControlInput');
                });
            modal.ok = modal.footer.add('bootstrap.Button#primary', 'OK');
            modal.cancel = modal.footer.add('bootstrap.Button', 'Cancel');
            
            // reference
            modal.ref0 = 
                form.add('bootstrap.FormGroup')
                    .add('a`martop20', {target:'repo'});
            setInterval(function() {
                var user = modal.user.value, repo = modal.repo.value;
                if (user && repo) {
                    var reporef = 'https://github.com' + '/' + user + '/' + repo;
                    modal.ref0
                        ._text(reporef)
                        ._attr('href', reporef);
                }
            }, 977);
            
            return modal;
        }
    }
    
    function getMwFileName(data) {
        var fileName = data.fileName, mwFileName = data.mwFileName;
        if (!fileName)
            return data;
        // location != *.html
        if (fileName.slice(-5) !== '.html') {
            return getMwFileName({fileName:fileName + '.html'});
        }
        // location == *.mw.html
        else if (fileName.slice(-8) === '.mw.html') {
            fileName = fileName.slice(0, fileName.length - 8);
            mwFileName = fileName + '.mw.html';
            fileName += '.html';
        } else {
            mwFileName = fileName.slice(0, fileName.length - 5) + '.mw.html';
        }
        data.fileName = fileName;
        data.mwFileName = mwFileName;
        return data;
    }
})();