# Use Go 1.23 for building, then switch to Node.js for runtime
FROM golang:1.23-bullseye AS builder

# Build GitHub MCP Server
RUN git clone https://github.com/github/github-mcp-server.git /tmp/github-mcp-server \
    && cd /tmp/github-mcp-server \
    && go build -o github-mcp-server ./cmd/github-mcp-server


FROM ubuntu:22.04

# 非対話モードでの実行
ARG DEBIAN_FRONTEND=noninteractive

# 基本パッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    vim \
    sudo \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    locales \
    fonts-noto-cjk \
    && echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen \
    && update-locale LANG=en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# Copy the built MCP server binary
COPY --from=builder /tmp/github-mcp-server/github-mcp-server /usr/local/bin/

# Node.js 20.x (LTS) のインストール
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs=20.17.0-1nodesource1


# 開発用ユーザーの作成
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME


# npm グローバルディレクトリの設定（rootユーザーで実行）
RUN mkdir -p /home/node/.npm-global && \
  mkdir -p /home/node/.npm && \
  chown -R node:node /home/node/.npm-global && \
  chown -R node:node /home/node/.npm && \
  npm config set prefix '/home/node/.npm-global'

# 環境変数の設定
ENV PATH="/home/node/.npm-global/bin:$PATH"

RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

# 作業ディレクトリの設定
WORKDIR /workspace

# ユーザーの切り替え
USER $USERNAME

# ユーザー環境での npm 設定
RUN npm config set prefix '/home/node/.npm-global'

# .bashrc に環境変数を追加
RUN echo 'export PATH="/home/node/.npm-global/bin:$PATH"' >> /home/node/.bashrc

# npm の最新版にアップデート（nodeユーザーで実行）
RUN npm install -g npm@latest

# pnpm のインストール（nodeユーザーで実行）
RUN npm install -g pnpm

# 開発用ツールのインストール（nodeユーザーで実行）
RUN npm install -g typescript @types/node ts-node

# デフォルトシェルの設定
SHELL ["/bin/bash", "-c"]