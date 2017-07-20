# Personal Cell Creator  
Personal Cell Creator is an adminintrative application that can only be deployed within an Unit Admin cell.  
It allows the Unit Admin cell owner/administrator to create a personal cell which belongs to the deployed environment with just one click.  
Since this sample application does not implement any form of authentication, please be careful how you deploy it.  

Improved version will be released irregularly. 

## Installation    

### Prerequisites  
Before the installation, make sure you have the following information ready.  

1. A valid Personium URL  
1. Unit Admin Cell name  
1. Unit Admin account  
1. Password of the Unit Admin account 

### Procedures  

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
