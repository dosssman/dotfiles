" Indent and tabulation configs
set tabstop=2
set shiftwidth=2
set noshowmode
set nu

"Use 24-bit (true-color) mode in Vim/Neovim when outside tmux.
"If you're using tmux version 2.2 or later, you can remove the outermost $TMUX check and use tmux's 24-bit color support
"(see < http://sunaku.github.io/tmux-24bit-color.html#usage > for more information.)
if (has("nvim"))
  "For Neovim 0.1.3 and 0.1.4 < https://github.com/neovim/neovim/pull/2198 >
  let $NVIM_TUI_ENABLE_TRUE_COLOR=1
endif
"For Neovim > 0.1.5 and Vim > patch 7.4.1799 < https://github.com/vim/vim/commit/61be73bb0f965a895bfb064ea3e55476ac175162 >
"Based on Vim patch 7.4.1770 (`guicolors` option) < https://github.com/vim/vim/commit/8a633e3427b47286869aa4b96f2bfc1fe65b25cd >
" < https://github.com/neovim/neovim/wiki/Following-HEAD#20160511 >
if (has("termguicolors"))
  set termguicolors
endif

" OneDark theme enabling
syntax on
colorscheme onedark
let g:onedark_terminal_italics=1

" Enabling VIM Plug
call plug#begin(stdpath('data') . '/plugged')
" VIM Polyglot: Better syntax highlighting
Plug 'sheerun/vim-polyglot'

" LightLine.vim: Better bottom line for NVIM
Plug 'itchyny/lightline.vim'

" Deoplete
if has('nvim')
  Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
	Plug 'zchee/deoplete-clang'
else
  Plug 'Shougo/deoplete.nvim'
  Plug 'roxma/nvim-yarp'
  Plug 'roxma/vim-hug-neovim-rpc'
endif

" NERDTree
"Plug 'preservim/nerdtree'
" NERDTree plugin for Git tags
Plug 'scrooloose/nerdtree'
Plug 'Xuyuanp/nerdtree-git-plugin'

call plug#end()

" LightLine color scheme config
let g:lightline = {
      \ 'colorscheme': 'one',
      \ }
" Deoplete activation
let g:deoplete#enable_at_startup = 1

