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
    && echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen \
    && update-locale LANG=en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# Copy the built MCP server binary
COPY --from=builder /tmp/github-mcp-server/github-mcp-server /usr/local/bin/

# Node.js 20.x (LTS) のインストール
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs=20.17.0-1nodesource1

# npm の最新版にアップデート
RUN npm install -g npm@latest

# pnpm のインストール
RUN npm install -g pnpm

# 開発用ツールのインストール
RUN npm install -g typescript @types/node ts-node

# 開発用ユーザーの作成
ARG USERNAME=developer
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# 作業ディレクトリの設定
WORKDIR /workspace

# ユーザーの切り替え
USER $USERNAME

# デフォルトシェルの設定
SHELL ["/bin/bash", "-c"]