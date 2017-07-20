# Cell-Creator for Unit Admin Cell

このサンプルを任意のCellに配備することで、ブラウザから新しいCellを作成することができます。
現状の実装は無認証で作成可能になるので、アクセス権限等ご利用の際はご注意ください。

なお、機能をより改善したバージョンも随時更新します。

## セットアップ

### 必要な情報

1. UnitAdminセルのURL
2. UnitAdminアカウント
3. 2.のパスワード

### 手順

1. [Engineスクリプト](https://github.com/fujitsu-pio/app-sample-unitadmin/blob/master/createCell/engineService/user_cell_create.js#L18)と[HTML](https://github.com/fujitsu-pio/app-sample-unitadmin/blob/master/createCell/create.html#L98)に上記1-3の環境依存値を設定する。（UnitURLとCell名を分けて指定）
2. [Engineスクリプト](https://github.com/fujitsu-pio/app-sample-unitadmin/blob/master/createCell/engineService/user_cell_create.js)を、メインBoxにEngineサービスとして登録する（コレクション名：unitService, サービス名：user_cell_create）
3. 上記のサービスの実行権限を設定する（例：allユーザにexec）
4. [HTML](https://github.com/fujitsu-pio/app-sample-unitadmin/blob/master/createCell/create.html)をメインBoxに配置する
5. 配置したHTMLにアクセス権を設定する（例：allユーザにread）
6. 以下にアクセスする

```
{UnitAdminCellのURL}/__/create.html
```

## License

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	    http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.

	Copyright 2017 FUJITSU LIMITED
