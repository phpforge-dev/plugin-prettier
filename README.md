# Prettier — plugin PHP IDE

Requer PHP IDE 0.2.10+. Instale esta pasta ou o ZIP em Aparência → Plugins. Autorize project.read para ler .editorconfig, .prettierrc (JSON/YAML), package.json e .prettierignore. Depois use Reformatar código (⌘⌥L / Ctrl+Alt+L), o menu contextual ou a paleta. Uma seleção solicita range formatting ao Prettier, que pode expandir até limites sintáticos. O arquivo é alterado no buffer, sem salvar automaticamente.

Engine Prettier incluído, offline e com versão fixada em versions.json. Não usa o Prettier instalado no projeto, não executa configurações JS/TS nem carrega plugins externos. Esses casos mostram erro em vez de ignorar configurações silenciosamente. JSON/YAML aceitam opções e overrides por caminho. PHP e Blade não são atendidos: PHP usa o formatador próprio da IDE.

Build independente: `npm ci && npm run build`. Testes: `npm test`. Instale pelo Git: https://github.com/phpforge-dev/plugin-prettier. Código próprio MIT; licenças de Prettier, YAML e ignore acompanham o pacote.
