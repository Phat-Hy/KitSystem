@echo off
@echo This cmd file creates a Data API Builder configuration based on the chosen database objects.
@echo To run the cmd, create an .env file with the following contents:
@echo dab-connection-string=your connection string
@echo ** Make sure to exclude the .env file from source control **
@echo **
dotnet tool install -g Microsoft.DataApiBuilder
dab init -c dab-config.json --database-type mssql --connection-string "@env('dab-connection-string')" --host-mode Development
@echo Adding tables
dab add "Category" --source "[dbo].[Category]" --fields.include "CategoryId,CategoryName" --permissions "anonymous:*" 
dab add "Component" --source "[dbo].[Component]" --fields.include "ComponentId,ComponentName,ComponentImage,Quantity,Price,Description,ComponentStatusId" --permissions "anonymous:*" 
dab add "ComponentStatus" --source "[dbo].[ComponentStatus]" --fields.include "ComponentStatusId,ComponentStatusName" --permissions "anonymous:*" 
dab add "Kit" --source "[dbo].[Kit]" --fields.include "KitId,KitName,KitImage,CategoryId,Quantity,Price,Description,KitStatusId" --permissions "anonymous:*" 
dab add "KitPackage" --source "[dbo].[KitPackage]" --fields.include "KitPackageId,KitId,ComponentId,Quantity,Price" --permissions "anonymous:*" 
dab add "KitStatus" --source "[dbo].[KitStatus]" --fields.include "KitStatusId,KitStatusName" --permissions "anonymous:*" 
dab add "Order" --source "[dbo].[Orders]" --fields.include "OrdersId,UsersId,ReceiveName,ReceivePhoneNumbers,OrdersDate,OrdersImage,StreetAddress,CompanyName,Apartment,City,Postcode,TotalAmount,StatusId" --permissions "anonymous:*" 
dab add "OrdersItem" --source "[dbo].[OrdersItems]" --fields.include "OrdersItemsId,OrdersId,KitPackageId,Quantity" --permissions "anonymous:*" 
dab add "OrdersStatus" --source "[dbo].[OrdersStatus]" --fields.include "OrdersStatusId,OrdersStatusName" --permissions "anonymous:*" 
dab add "Role" --source "[dbo].[Roles]" --fields.include "RoleID,RoleName" --permissions "anonymous:*" 
dab add "User" --source "[dbo].[Users]" --fields.include "UserId,FirstName,LastName,CompanyName,Country,StreetAddress,Apartment,City,PostCode,Phone,Email,Password,RoleID,CreatedAt,StatusID" --permissions "anonymous:*" 
dab add "UsersStatus" --source "[dbo].[UsersStatus]" --fields.include "StatusID,StatusName" --permissions "anonymous:*" 
@echo Adding views and tables without primary key
@echo Adding relationships
dab update Component --relationship ComponentStatus --target.entity ComponentStatus --cardinality one
dab update ComponentStatus --relationship Component --target.entity Component --cardinality many
dab update Kit --relationship Category --target.entity Category --cardinality one
dab update Category --relationship Kit --target.entity Kit --cardinality many
dab update Kit --relationship KitStatus --target.entity KitStatus --cardinality one
dab update KitStatus --relationship Kit --target.entity Kit --cardinality many
dab update KitPackage --relationship Component --target.entity Component --cardinality one
dab update Component --relationship KitPackage --target.entity KitPackage --cardinality many
dab update KitPackage --relationship Kit --target.entity Kit --cardinality one
dab update Kit --relationship KitPackage --target.entity KitPackage --cardinality many
dab update Order --relationship OrdersStatus --target.entity OrdersStatus --cardinality one
dab update OrdersStatus --relationship Order --target.entity Order --cardinality many
dab update Order --relationship User --target.entity User --cardinality one
dab update User --relationship Order --target.entity Order --cardinality many
dab update OrdersItem --relationship KitPackage --target.entity KitPackage --cardinality one
dab update KitPackage --relationship OrdersItem --target.entity OrdersItem --cardinality many
dab update OrdersItem --relationship Order --target.entity Order --cardinality one
dab update Order --relationship OrdersItem --target.entity OrdersItem --cardinality many
dab update User --relationship Role --target.entity Role --cardinality one
dab update Role --relationship User --target.entity User --cardinality many
dab update User --relationship UsersStatus --target.entity UsersStatus --cardinality one
dab update UsersStatus --relationship User --target.entity User --cardinality many
@echo Adding stored procedures
@echo **
@echo ** run 'dab validate' to validate your configuration **
@echo ** run 'dab start' to start the development API host **
