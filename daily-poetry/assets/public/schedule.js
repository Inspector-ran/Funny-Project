(() => {
  'use strict';
  const epoch=18262;
  const kinds=['唐诗','宋词'];
  const legacyIds=[
    'tang-c65539db-4e2b-4ce4-a22b-563b6ef3f4f1 tang-c244a5b4-0ed0-48fe-8694-95309acac184 tang-a1824eb8-4e2e-4d53-9a33-e1dcfe7d1c73 tang-0f7504df-cda2-4fe2-bc63-867ec2e418e7 tang-bcdf6f13-4cb9-418f-9279-c690522e0a27 tang-0167687e-8325-48bf-8da4-3749c9ce0a74 tang-efaaa86e-5628-40d3-a137-1ae8fcbe41b8 tang-e0eb3016-9288-4dc0-9257-3de36e5ad73c',
    'tang-b3de619f-cc8b-457d-942b-49f06651aba4 tang-d7c6d072-6e84-482e-856a-5a4c21226a3c tang-75db753d-e7da-48a1-a6c0-6ed9147e58db tang-0d2c5fba-d350-4c3f-b55e-72a491a84df6 tang-d32a2610-09d7-49ad-8cdf-dd9c649144c7 tang-fb376b71-91c6-44ee-b2e4-40f5b3f71b8f tang-670009c2-a701-4140-aa31-b4973f76d632 tang-131c9f87-273f-4684-9b67-bd7b58ad4008',
    'tang-3410e7ce-df3a-4ab8-bea3-7f681661b240 tang-7377e34a-1aab-47e3-a6dd-376c98a5d6b7 tang-811a5f9e-0df5-46f1-a587-0d4df7bca5a0 tang-91f95b30-c42f-470a-9df8-dd6284fca474 tang-da157c27-d317-4205-9cdc-a254445659fc tang-974914ee-1fc0-4952-a863-820bad2e4065 tang-ed79f9bc-d5d1-4251-b22d-d091e0758a3f tang-2161a569-6250-4886-9500-2168821b62be',
    'tang-8331c76b-a250-4d07-9c28-b8a456e0974c tang-f7c9c409-9571-4eb8-abd9-91ec6c1ff564 tang-e006dfd3-40be-40ef-ba3b-552428931ae3 tang-b6475dea-1d69-4f0d-b98a-39393f47741e tang-02456f60-6ab5-4de8-b9ed-f7519818f0ca tang-15c6cbc9-753a-4f09-86bf-4fe2d8bb1fee tang-9380d4f6-e19d-4ff1-8309-07f4ede69f7c tang-ae660471-84bc-4a58-a438-005b8a99c3c1',
    'tang-19796737-ec7b-4c33-8df4-a81a7ca2cc10 tang-4c5b328d-2ab8-4f4d-a0c2-627b6cb0c92b tang-9154fc22-5e19-45b7-a506-435298bb26fc tang-f8d102c4-b25b-412f-afce-35db35c339d9 tang-7456691c-636e-46d7-9093-edc778b0a7ea tang-f2f04c30-149d-4b2b-bce1-1334adf84739 tang-7e75853a-bf7a-4d8d-b3e9-0537f4ed913a tang-5ccd5188-0e5d-450e-8ec5-d6e661fac4f7',
    'tang-b41e25f5-5a57-497f-a3a2-84bdfb9331f5 tang-8b57e03d-6d1f-4a4a-ba34-1f58e2551ca1 tang-ea3f91f0-487e-4df7-826a-3692ef82e64d tang-82f57261-b608-4ee9-8d88-7fde20c49a7a tang-02943f6d-2c91-4d9c-9690-247eab9ae3ec tang-ac2ec0ba-10b1-4ae3-8859-1e7752625331 tang-31e9a6b0-5035-4b1b-a9d3-ff1c279f53b6 tang-1fb10ea4-f46c-4c08-bd06-f039f1907be6',
    'tang-b9521e2b-963e-4d90-acf3-d87c2a135071 tang-5bb5c590-5de8-4bfb-aee6-30bc4bcdf99a tang-1f28ab03-8388-4a2f-8c4f-3ce47789e221 tang-31cc87f3-da0f-421d-8674-8753530077e2 tang-56bec3c2-9c0c-4d40-9750-2e28bdc9a20e tang-a0576d39-c4ac-4608-a4e2-249b6c31fd1d tang-204e287b-8194-4c2d-808b-11cc260412ae tang-4d6f83e9-8232-4db1-903e-f9e619df5ecb',
    'tang-d5d66aff-b6ae-48cc-9160-16b096d4ea49 tang-3b847cf5-16b1-449d-a436-e5995c6433c4 tang-4925c861-b0f8-4b2f-923e-9cba2df1323e tang-a2b4e8ca-92e3-4101-8a54-739b8f1d8184 tang-65e9c24b-bdbd-4ef9-9e14-012c8fde79b8 tang-263b4a33-fd51-47e1-b49a-d84dd99a2e0f tang-9a5070c8-8b6a-46d3-a976-ce942baf42e7 tang-e73e2743-3752-4ba3-938a-fb59cd3965ee',
    'tang-88e98bed-27fa-4dbe-8d6e-e7cb8c3e4d97 tang-14ae27a0-2641-41e6-8c0a-60a9185f8b6d tang-1deac6d5-6da0-4d9f-a182-2f0697cbb932 tang-8eaf97fd-82bb-4651-9dde-9a5a6f78182c tang-27ff54ab-4861-43d8-b3c1-69113d2e4e10 tang-24ca9268-9cbd-423b-b423-12e1a9aa9041 tang-7c93c162-d424-4d91-b71b-7c9b81713b8c tang-8de30193-fba7-4aef-9ff9-c3726a22104d',
    'tang-54008cd0-f9bf-424f-bc55-f15c1e9025f3 tang-a7f425de-143b-493d-bb51-13e27c68e871 tang-92ae04dc-89af-45d6-9e31-204a01df801d tang-d12edd29-d467-4b19-b3f5-533fa5c8d56a tang-80159919-0b66-4956-a563-ef9bcf6a05c0 tang-200fe9fa-0221-4123-86de-4d63ce9d3daf tang-fedb06cc-37da-4aaf-8f39-85ebcb08b947 tang-292c14cd-151f-4321-a94c-46fc86693eb3',
    'tang-afc2e6d6-e67f-4513-a6ab-82841d2f97cc tang-fde30eaa-9b2c-47ce-ba49-c1356353ac9a tang-549a5a94-a8f5-436e-bc9c-1253d01c1940 tang-d755f74b-18fd-44d1-a6e1-43e77490bb09 tang-9bd49546-5289-4351-97f4-d69296720dfc tang-992df222-c445-4925-a656-0caa4447d5bb tang-7f3799de-78b4-49bc-b6d8-a5fa3ecacd33 tang-4c745990-657a-41fe-ba2c-d9cf371ca563',
    'tang-3138fe30-6cf6-45b0-a441-2d5398107a9a tang-f0cd6afd-c89d-4fc3-b214-bcbf63042e8e tang-72aab9ef-65a9-4a8a-b36b-61932c09ce85 tang-c26445b5-a433-4cd7-9020-435866b845f9 tang-a746d1f0-a72c-44d2-8b1c-c5c990749257 tang-6556f501-f5b9-4353-bde2-75ec0e1bb616 tang-fdc07d9f-95b8-45f7-b1b3-9d272b3416a4 tang-04af557e-bac8-4fbf-92e7-d8a87fa11038',
    'tang-1487452b-5f49-4f4f-9913-1f3ec1cddf95 tang-d9dd3520-9aab-4b1b-bd57-810f29391667 tang-8cefa67f-2b9a-4e13-8158-4d38cbfb331b tang-3f049d66-1513-407f-bb4e-cf25a7b5069a tang-41d292d2-b752-4c30-8b6b-7b7380f2f9bd tang-1c1d545e-07a1-46a9-bb76-b7473c1fde43 tang-0445f296-5816-4ab9-a617-7d8ed29088ea tang-56ca5b29-4bb9-4f12-9200-6bc7c72e4e47',
    'tang-f8afed4e-e8cd-467f-afae-51dc149921f7 tang-3e504df9-b22d-480e-9e7c-9f8ab8591b91 tang-cc0e7ac3-bde4-4491-8ae5-027106709e72 tang-6975adab-25d0-40c6-af3a-3a05847e7717 tang-0613f575-4f07-4326-8591-603fb3d1da45 tang-b1dad78c-4dd8-4b99-b37b-741ed761f26a tang-8e18183e-5a58-4805-b672-1726969d6526 tang-7f4cacb5-cde8-40de-9b14-e223879cc2f4',
    'tang-d2b5090e-e6fe-4d4f-9dd6-fe94ff6d4b5c tang-b71d7c9c-7e92-4797-b2c9-8715dd0c2881 tang-9309205e-1d08-4a7b-99ef-4a05a9ee4370 tang-542cb326-1037-4bd9-b0f6-6479d165dc4c tang-0f5af383-765a-4d56-b00b-79ee2ccd5111 tang-cb168b3b-d104-4df7-9868-1e1225ddb941 tang-0bed9b02-991e-4e28-b631-86640147a712 tang-f15c4b50-ee89-4927-8cf3-15e3a6a6ab95',
    'tang-e5e5f969-ddac-4491-9cfe-d77742e1416d tang-94ae3e7e-eb5d-414c-bfd6-124f50687ce5 tang-ce491725-b96b-46a7-b83c-463d2094ef3f tang-6d2e12c0-c1b8-4242-888c-9dba1a8f93ce tang-ee2a3000-9127-43fa-8618-89a1937322cb tang-9a4d3eae-fe01-46c7-a28b-8b518614a508 tang-fae577a5-da28-4672-83ff-94c97ae2a4a4 tang-f4301f96-e872-4eae-aa51-0d12328059d1',
    'tang-e4354c00-c83e-43da-9341-7007889dd625 tang-00f12a19-bb96-4980-a4f5-11a1b9d604dd tang-6d098c75-038d-45f4-8f86-73976c355e44 tang-40cd6eec-c6ce-4659-a225-61063cd210e9 tang-a5b1f5c9-1ba7-4533-b497-55b1d4af1bbb tang-9080a103-2750-4b9b-a4fa-1167cd670a0c tang-ce71032a-c075-492c-9554-51eb080348a5 tang-a364504e-3cfc-44c6-9203-173856452cdd',
    'tang-7950a49f-f51d-4926-9d1e-e5f76b153829 tang-0949fe2a-aadf-4cd4-b1c3-25fcdaecdb96 tang-2e8999a9-9df8-4483-ab1e-0231c3e46320 tang-36e09cb4-4fb7-48be-b6c6-c9bd906d9331 tang-c8a4faa6-8666-44f9-b4c9-df78d7af844d tang-4c7205af-d1e8-48ed-8220-fe095418b95a tang-8baa7c35-9afb-40bf-b5e4-41d9895e2710 tang-6bbd1c2c-8c43-4ffb-b7b3-506d74266cee',
    'tang-1575c835-1241-4d7b-99dc-6d700549ac65 tang-80fe70cd-6e63-48eb-9c1e-ab26330d45d9 tang-10a0aedc-4b39-494b-a36c-28c6df28a668 tang-2188f98e-d5f0-4740-b94b-e1497a3619ee tang-39b2954c-04df-4561-ad6e-f4ddbae0db1e tang-c39225f9-16b2-4713-a11c-d7030ec3b1c9 tang-4a732464-35a5-4ffc-94d0-37d653eef2a1 tang-6beb5cc2-ae49-4e23-952a-1cb92fa11512',
    'tang-b4780bd1-1703-4bce-a801-d5ed566826b5 tang-bea6f283-8f90-49b5-8842-1cb906816548 tang-7d906794-b4d1-4922-9c59-eee5b19602ad tang-9e6cbc1b-95ed-406b-8c9d-d05876a1342c tang-2d66a9e4-7b4d-4be4-91fd-6a4b2cd8817b tang-f1496cf4-4f85-4f9e-9e0e-dd05370641d3 tang-361a3e5e-ef71-4749-b39a-aa2f5d9180e4 tang-6340ef19-35e2-4194-96a9-3ee0a667905b',
    'tang-6290b8f0-48de-407f-be2c-629140d91f83 tang-8d58a158-1a9b-4085-8ef7-b7b4e6adb66d tang-59fb3f01-65b2-416a-aefb-c13e502bfba1 tang-e2fec465-cea1-4829-b12d-3ba37a267562 tang-de6b7e3d-03cd-4daa-bdc2-7fb820fda441 tang-d0fa1454-f337-4343-ab4a-2a42dfdf4e8f tang-4ac3f099-73da-43e8-a4e5-1dbbd9427491 tang-090b7792-2942-4f3c-a34d-caccd066c76f',
    'tang-c854a853-b015-4848-823b-a786659d33b3 tang-d5da9d7d-1e52-4992-8be5-73e556b07e0b tang-59063901-7dbc-4f22-974f-ddccab675cbc tang-f91f3117-2bf2-4d12-999a-aca174124715 tang-569ef0e1-887d-4d98-b869-9634f099c8e9 tang-0a0f9231-d88c-4f81-b941-83b67a736194 tang-0fb0189c-8ff3-4106-af94-f6d26d528a1d tang-0174cbbc-31fa-4daf-b1cf-7f91c6a646a9',
    'tang-a2aed629-465d-412c-a68d-780068488725 tang-9972f7bb-ae5b-49e4-87df-381386af66b6 tang-4f6575cc-12cc-4986-8bfc-5cedac7bb68f tang-ac97d42b-8fef-42c9-829f-baafe89b4cdc tang-b7d50789-e0d5-4291-8014-eddf65a124df tang-315bc0e1-f76c-49d5-9940-b212e5f9c2ae tang-cae8a893-7ae6-4824-b4c5-eada730b075f tang-a6144ae0-3bcf-4503-b58d-9abf24d6608c',
    'tang-16ddf43c-ac3a-47bc-95a5-36a49bceb30b tang-c836e52f-2346-4a3e-84bb-97514b17faf6 tang-9d33c118-cde9-49af-b572-c43427a10b48 tang-d850db6a-e07b-4fee-b642-57a70bdbbed2 tang-84bd91bd-11f7-4218-b9e2-b05b06ce8b99 tang-19867a30-1b67-4123-b367-44565bab6516 tang-51262a8c-de53-41ee-958a-de08d5f5a446 tang-bce40ff4-816c-490c-be30-04de15f7c25e',
    'tang-ab4b1a7f-4fbe-438b-817f-9e1ed2d39f4f tang-1b9b8047-2410-47ae-a24c-aad7342b338f tang-0055db4e-e8d3-41a0-b201-0e3b970e27b6 tang-2954ddd2-f1c7-41b1-8c9e-42058398cde0 tang-3d26433c-a673-4094-8c83-cadb1b08412a tang-469dec8b-ba5e-4faf-b52f-2ad203e38d81 tang-1f92134b-bca9-46eb-b2fe-87b30413041a tang-51b1aeeb-9a66-412d-b15c-4afaa6c6b1d7',
    'tang-2f37297b-77d5-412b-bc73-105bfa4d011d tang-59c7eaa9-3c05-4857-8cff-10376706ccb9 tang-e9e6425c-6c14-4f69-8694-87a8b96a43de tang-2769113d-0cac-4e67-83cb-0c10685f8381 tang-f88a6dbd-bf83-458c-b5e2-85fdd1ed98b2 tang-c1280e87-ac81-4f9b-9de5-377d6af38ae8 tang-2c036362-9f1d-434c-854f-b97a2a4bb19b tang-a353dcb1-12cc-4ca8-af1e-55d1d62445f8',
    'tang-9da0cbe5-52d4-4efc-8be2-2f78f1a8f097 tang-d77f340f-1a04-4c5b-9704-2536e4249c6b tang-c2c83ee2-940f-4ae3-9ab3-4f509d2991f3 tang-22e90c0d-2b59-4500-8e5d-80d38ec4692c tang-a4d718ee-c020-42b4-97df-499cd0076f7b tang-c19e64b1-604b-40b7-9e41-6ef57b9c6f7b tang-12919986-2d09-4d2e-b5ad-f2485e40ada5 tang-f540f519-e3c4-41c2-b299-f1d255977705',
    'tang-f96506ea-e8ac-47e0-a0a6-ccd306e56645 tang-0f5874bf-3748-44c9-bc3a-be4a8c3eb2f6 tang-927908c0-999f-4d3f-8192-d67d28f93576 tang-03eb4001-023a-4920-bbc7-a0fc52b2836d tang-acbe1729-cefd-4678-9719-09c5c9c27db0 tang-3b5db620-1964-4674-a01d-ad70ba3ebd2a tang-733afc7b-e370-4724-b755-e9342c574d22 tang-87f5949b-bdad-4b5e-b488-7015bd45cc4f',
    'tang-ae5b1a15-0b5c-4578-8f31-1b60030633a4 tang-5d05fef6-e4aa-48e5-917d-c29d0e6d6b33 tang-15180235-db35-499b-8fd5-b8d9fa92f5f2 tang-2c152693-c25f-45ce-8ef2-cbedce1a62bc tang-058db0d1-0656-4e8f-ac49-87622e16b19b tang-eb9530d2-e4c7-4c34-9214-06c28ca586bf tang-368fc6bb-1636-419e-8ddb-cdc1dd07a1ca tang-fe6f4b72-855c-43b9-8883-8b3fe3cd8bd4',
    'tang-b881b056-6d92-45e8-9620-4710a375776f tang-2c24cec1-4105-4511-bf8b-bc6d5d8d48c7 tang-12fdaad8-b197-4526-b56d-c7c713267248 tang-bd57a0b0-28a1-4d53-bc09-51899d2dac38 tang-6c7c45a6-c944-4ff3-aa99-f5cb0440436f tang-370b53ae-949e-45cf-92b0-3aca072c1b86 tang-8474f5c4-d18e-4b42-9702-19ad909b9ea2 tang-bd7949f8-c961-4bfd-a307-1fe9e621028c',
    'tang-f2db30a1-f125-44b9-a8d8-287ccb69238a tang-c9362aba-fb50-481b-a4cd-08ddd65cdd2a tang-0710a746-8660-4bc1-b073-8ce51ac9f4d9 tang-827e44b1-7064-4ff7-9a9c-192eece94e2d tang-13b12259-3750-4c6d-87ee-35283ad63dab tang-6d303931-f900-4f29-a8b9-caea611a521f tang-383d41a8-5155-4fff-b91f-87d5585ff03e tang-61304178-6b16-4f98-87b2-4ad6bc98da98',
    'tang-0db5450e-f1e0-4d53-8106-529def535537 tang-e4a87504-f9a3-4599-b770-aba4afd3cb04 tang-a8617715-ad59-4da8-8071-e9aeb1760e6a tang-9b4f2d56-6df4-4999-a82c-11283529dd51 tang-6df38a77-6e5d-43ae-a115-7de36475f53e tang-f9798830-48c1-45e3-be90-4028d93954dc tang-11b013f9-aa6a-4e55-8e68-195dc62f161f tang-565d931a-ff49-4f37-b633-524b48c2f4f0',
    'tang-80beb8cc-8338-44d4-8b96-7f9d32133c97 tang-4fa92777-9bd6-45ca-9272-bac30459cf5e tang-297dd100-6aab-4685-a52d-983fb0999c7a tang-a9d3bfca-8402-4946-ad02-53db1964a3b2 tang-4cf19354-4c0a-4e55-980b-69fa7f81ed0f tang-b700208d-d859-4e36-96bf-883c81d4df0f tang-15274300-bd45-4898-ab14-9a3dead4b620 tang-42f17f00-bbc1-4b5b-82c1-3e9e012725ba',
    'tang-c8210485-a1f4-4c76-a1f6-2f5e57d39d29 tang-1ce94bde-41ec-42b8-abef-e1e1be55be7c tang-8af643c9-a8b0-49b7-b8e9-88920ab0bbd8 tang-3cda5a92-ffa2-4af0-9217-97ce36113705 tang-ce493923-7c4b-41a9-94e9-cf95741c018c tang-b411ce1e-ac09-4427-ab32-f8dc7a57e566 tang-77ac62ee-6396-4ac0-a3ab-cb84ba2e5cd0 tang-8435b46d-bbf1-49e5-af66-6f2d5681f1bf',
    'tang-46503396-3bb3-449c-9c84-f2ff232f7949 tang-96455db1-a0c6-402c-8892-05c6b9a3d029 tang-83dcb67c-ccbc-4592-b232-368a6b5275ce tang-f800050a-d7a0-4f12-a614-17fe23df8f41 tang-b8ae44b3-ba8d-42d3-85a7-a70aa8608379 tang-11424603-9a22-4564-89a4-95e1766f9685 tang-3e0e1d96-c249-47c4-b16d-4d91dd6e7cce tang-0ae0e3bd-a32e-481f-9719-b283da2da964',
    'tang-b67ddf05-43fb-4859-a1a9-34f95d45aabf tang-93d82a12-5e4d-45c2-b837-d0c54447fba3 tang-294bc7b2-b4f8-4a53-be17-a40ded4afd1a tang-d129dc0f-cec9-4073-bb89-cb9312564d9d tang-f5e021d7-ea56-4341-947c-8fd024018e1c tang-2779f710-4ab4-46cb-a2b6-1889752f26c2 tang-8df8e94b-ffe4-4930-af4c-491d7cb04651 tang-07238ad9-c348-43d4-b1d7-25d89369286d',
    'tang-8324db66-b75a-40ff-9469-cba276d2f88f tang-c348bc2e-f50d-436b-88b7-c198d63dacfc tang-801c3192-8001-4238-8ecf-0111f490e84c tang-a7b8e17f-ee93-4bdc-a144-b1ba5ab32bb5 tang-3c1693fc-f4e6-43b7-a66f-6379c3a26eef tang-a65e5646-14b1-4f75-924b-bbf262b242d7 tang-99167d13-8e2c-4b75-bf93-62b0682dfdd0 tang-ca2c489a-e433-4c0f-8248-77d354f0665e',
    'tang-7277c420-9f3f-4093-a5b2-6331494721e8 tang-57203d7f-380c-4052-b21b-d1ea79fbe231 tang-abb3e465-f10e-43dd-b564-a5de08010478 tang-baccf46a-41c4-4a0f-b90f-37cc35b04a64 tang-f990af2e-d929-48da-a9b3-fdbc706ca4a3 tang-9d1b6a18-571c-4f25-bfdb-3fe260115c3f tang-4e491c2f-c3c8-487f-8e76-63bd0a811b30 tang-606d0bd8-31d2-4a7a-97ee-341956e7be60',
    'tang-809ad73b-9a8e-436e-9874-f9295b624af0 tang-d43a4767-2240-44b7-8d5b-c2acdc689839 tang-bf8918b8-a05a-4ccf-bb2e-3f9b81f6bbfc tang-1f83fccf-7476-464b-8cd4-8a2b4569c7a0 tang-5593d522-b820-4c06-bab6-0ab5a0fc1d46 tang-ca4cc6b3-a324-48c0-89c0-bb36c09c4930 tang-4af86c76-18b3-4069-be90-6d8cef430bc7 tang-9525f99d-39cb-4d04-8650-263493d223e0',
    'tang-7e1be9c9-fa2f-44c2-a6bc-3edcece745fe tang-83e70b6e-ff59-4a3b-8e81-249ab0cda0c3 tang-71999aa1-55dd-4449-81b0-41f04686bf2e tang-22e72306-f41c-4621-a925-83bab7f9d76e tang-a68013c8-4630-41c6-a5ee-a658b57f58fe tang-9f5ded08-4f6f-4641-878e-897904483479 tang-5b3a5651-2a80-4fb1-b1bf-c9fb5ec38905 tang-bb111748-d8f1-4a5e-b618-b70272a7a642',
    'tang-09788f19-1e11-4394-a543-0edf2cfdcae9 tang-0ed53ef4-30ca-41ac-a629-d778e5cc2bfa tang-e117d224-39ca-4eba-a047-0d36ce8b8c26 tang-1b6f2389-2d09-4d51-982a-e7efb35113c5 tang-f93545e7-747e-4d12-a6c8-e484c46b2860 tang-4bd5be2b-5788-42c0-a300-9d106a73d46e tang-7ccd9915-51a1-4748-9989-af243036455b tang-aaae5882-9b74-4b45-9bb5-9f773a721119',
    'tang-d4baf2d1-ea61-4fb3-a284-e889275bdca2 tang-caa023cf-9f55-450c-9638-1cf5c0223cc1 tang-527eba4b-b35c-4d29-99e7-8f40c6f3d5b7 tang-e12edd83-36cd-4e8a-a630-91874631c51f tang-b4f9c5b3-0108-4127-bf3e-73fd207176f3 tang-4bef9a5e-f4a1-44bd-a78c-cb0fe38ccdff tang-8d480633-1876-4082-aaca-a7b3a26c04d7 tang-1352fbf1-2c3d-459c-b4ac-061e0c6befb8',
    'tang-15079155-e95e-4abc-b36e-f6b605848f37 tang-d35f583a-c20c-453c-a886-e13f98b2e4b4 tang-79e7ec6e-0d6c-4f95-8181-4671c42e1faf tang-fc1bc01d-c281-40fd-9e0d-4c484539e4ae tang-63950163-6a10-4e74-af8a-09886e4ef2a8 tang-526d4ecc-e123-4b9d-a213-958bb947593d tang-a2b4fe60-9809-422d-afa7-143a2088f045 tang-92dd65da-8301-4c83-b8f3-986b6095c481',
    'tang-67c18ea1-db49-44b5-8b21-6176e4a86416 tang-aa9f9e4d-aa34-496e-89cf-cfef61efa89d song-a574e6d873535699 song-2dccc64655ef84e3 song-7b18ff5894561bab song-c202a29f1e6134f2 song-8136249c8fb194b5 song-653ad4986ff44719',
    'song-3db5be5089c6c989 song-ca0626ae5527ef21 song-ad39ba5a9a9ef633 song-1f10166ba034e412 song-df6a399cd3c5720d song-80bf37e70f2c30b0 song-c37cd4efe4f5e56e song-eed1f4577f65b254',
    'song-12135e8a5ebc78fb song-70caea788488384b song-ca66f3f013113495 song-19d010d8cf316f85 song-35e3186a2085891b song-34a97ee84ced9b0d song-172f41612dda07fe song-ecc40d2590267026',
    'song-9b5f5059052d6030 song-591c7c238ed94e52 song-7703f59cab55c6e9 song-b9e831568d83fec5 song-570b0891eaca40ca song-6525bf7611e6bf2b song-c1506b22aaa06e69 song-3d192a5ee8e6a61b',
    'song-d10024bd7a8d7f58 song-ebfc47a21411fc61 song-cc6ab677d718e62e song-3156b59d96c7a554 song-660e3eaad55e9ea9 song-f969bcfef4e696a9 song-59361ed80cc4a527 song-cf9ff7821c9e3979',
    'song-4a1279d9e7f58c06 song-317f05a262cd4739 song-be4c622ab705de33 song-6da733d1f64bc7a0 song-f978fa1917280134 song-1e63a10cff97f92f song-5e62f811aad05646 song-75e08c61b6f70f14',
    'song-9e81b2263bf46107 song-f431d20347e1190e song-168f800534421126 song-48b384b3070a1056 song-16f6947325dbb27a song-97a48f36f6ecec19 song-b6536a40c1161ffd song-6e760e5492a036d3',
    'song-ea7273b8ffd1499b song-0f377c3c295d6ec1 song-935a18d08b75409d song-4d3404580b6c23ab song-ac080445f38c63c8 song-915ebee617169f8b song-cc9d5c3a4ebeca77 song-bca9faad7187d0d2',
    'song-55cb47a098b70ecd song-86b6897bef3c29a6 song-f885eb5099126909 song-80296ad5fa31f386 song-8ae2bed27c12b7e5 song-a3e80d6909bc9568 song-30990ffc4d91039f song-4398d0893c8ab12c',
    'song-7c84dda192984746 song-38e8858b895b808a song-d4be47469d787ffd song-68cd05040281d251 song-09de8416cc2df9c1 song-edbb2cdd0672e4bc song-b9bad56204f0b293 song-9e1dee3b89cf808a',
    'song-59a6b01f520195ac song-c135ca58a56607db song-c3b39a9a3159bd4f song-305d6e93311d5b10 song-02121c5d11679514 song-3f2c23d168c90dfe song-1ba7a9de7265fcf9 song-16e975148bc8cea7',
    'song-6bda30f9156a40a6 song-55e894710ceb99d6 song-07c982afd106aa7c song-f7367a2095d70165 song-cff43a5f3c09e61e song-e767a71830d0557f song-3d13c557f316dbae song-1ba4579b29366282',
    'song-fa3b24c8e4f79489 song-cead92185af5d231 song-10c4ae8df6684f4a song-3788ad391a565402 song-ac8c790e143746d7 song-a84026ddfb663008 song-816890aa1c1276bb song-74c1c02943d61f5c',
    'song-42282b1ef144f695 song-62df99afe1a60b8c song-b90fa019d91bad6c song-5eea95979f31fd5c song-b3939fa73cc752fa song-1c4014ea78c6ca9f song-c4e47479532d948a song-22a8062cf695c977',
    'song-e03ed6b2b054984d song-212d893620e5531f song-e5f03d0384094898 song-8ef77a50e37f655f song-32518e6b7103a6e8 song-837e9bd5688d62ec song-6e29493b83fca542 song-04a1175521a969b8',
    'song-c36e21f423f3b301 song-c12b3313a4e1a082 song-c4ffc9cbfde7349c song-bc3818ba4d1bc881 song-f389c4ee0d3edc1d song-a4dddf173b9f67fe song-1fe3cbf4651f7715 song-0c50a34b5487681a',
    'song-a34afeb0a706d475 song-d2f548c780c1455a song-4824b88a3f548703 song-23db40cb03c644fc song-7f118d0a510da7c5 song-0ecbf60fea3cf10c song-2608e6b1977b55ec song-18de677186b7aefc',
    'song-0914efd826b8d385 song-5f84aaa4bb63ca99 song-9a748b519dc76cd0 song-82a9eabdc1d1d7e4 song-ba507e61204ecdfc song-63ef7286930ab77d song-442e1d781e455201 song-3e431dbfd7b919b6',
    'song-889aad9b11d7c4ce song-4f0b237f3c820896 song-315863f828e45bdf song-8ab6da75d24b7ed4 song-98eadd2f1595d6ce song-fb56817cdd343093 song-8ae16abe8a0a4cc7 song-92c01b1836e17359',
    'song-979132c7fa83ca30 song-0ad88ffee9d7ce0f song-3deae2af7d5fa170 song-f8eac7ada96d7544 song-b3edafaae91114c7 song-ea8bb1d9c335ecbc song-76af0a1a299aeca5 song-d33085910a827f12',
    'song-a4c1ae5552190cfc song-636df312e13a9557 song-e3dce333888a1a5c song-8fd04a9817ec8305 song-54f49fdeac1b9ee5 song-e2e431b0c8fc48f1 song-e186028fcff4bd88 song-65f55bdb4a88ad9c',
    'song-3f9d06316b084a92 song-915e59934188f0fe song-c3a89e9c262bc4c9 song-cdd56d9a655ac11f song-c238827558af652a song-f50132e09be5e1f1 song-94dd0e3304a4793c song-00acc24d9180eba0',
    'song-923b05271e17dcf2 song-b35a83acdc0c240f song-0231a5322391d9b7 song-3b6cadbc71f0ffad song-c389fb6e179e7a1b song-24593c4a8f40c8e5 song-7566a888b0368525 song-8f28950b14246eb8',
    'song-b9c29dd1ddbfbbf2 song-97bcad65f2ec18fe song-539141a86826c601 song-3f1a10c27a456e05 song-826dacabdfb8b134 song-644ed2f4b86b2ded song-dcf7b321271ae904 song-eeb1451878eaf95d',
    'song-b7354e315d1c3792 song-2b7cf594cb152ebb song-2d81f3508cd8071b song-8b90c30fbdacd496 song-227029a559fd3e22 song-e6e9f4ab43120436 song-52ea7e624b13cd27 song-c2591383e61a8c00',
    'song-05e2da3090899991 song-2d3914d75a434820 song-45ae82ddecea9454 song-295f4aef93916472 song-ba0c28b3f36d7610 song-b729a492bc279d3f song-cbc4ced3a465ec1c song-46053d12175a2ebb',
    'song-61488a18c6366cab song-499296f57a67f5f4 song-1d8f77a2d7bdea03 song-3aed3c6076930f2f song-60867ae86c04a963 song-14333ab38db1949a song-61053ff01d688d37 song-5837a2b5fc311606',
    'song-4dd433fca6f47fbd song-1a419580bcb461ef song-b6d99e3f066a7a64 song-80eb91ec758ea5fb song-070a8a49b2989cd4 song-7004d69b52ab06c2 song-07572c7479934825 song-23d9b71fa2ca2550',
    'song-5d2bb4e684b15033 song-c116503ee936a535 song-6aa4e9c1deee86b6 song-e16d247d095bfd02 song-0b924515db54a650 song-b80f65deaff80bd5 song-cfdf86467cfc405d song-64610b322e6f04cd',
    'song-5e07e50de5a4bd8c song-19f7e37aa58fc829 song-282775787731120b song-04583742eb2c5a77 song-dbdb29a6fe686e0f song-0c6e74c1c7d603c0 song-f7659d2f9872e3b0 song-10077eb4c24b20cf',
    'song-ec986dd98347d1b0 song-bee818b286f685a1 song-ec36bb505ff588e3 song-b3fce5445457a711 song-88f394923382acdd song-058116b0d6951497 song-eb0cb4f920cfd33a song-8af04777ad49bb04',
    'song-b5f81a83e7ad8240 song-988fb14f5db49c1a song-5a2528e004f66479 song-e3f0ae77183cd7c2 song-9ba968ef214fec3c song-780dc6c70d3816e4 song-1f6767ee71dcd379 song-70d388638732b2fa',
    'song-2a4ccc2dc9549fa6 song-40ec4bc6f3b59a31 song-1e4205c57f45af7a song-3a2af64d9521940a song-40716390e11f57c7 song-6fb9455a4f6e05c3 song-ad451a510a578f8c song-8d6f1fa92d46a060',
    'song-207546209d142f07 song-fddff83bbac671c8 song-43fe6ceef574fd33 song-f404a9388ea7a9ed song-d99f1a5f7b827200 song-4349b1812a1e239e song-f71549b9fcf2a560 song-3fc0068011336c53',
    'song-c4e4e30d02bb5ff6 song-697c331943eafbb2 song-f681369b37db61e0 song-98f2f0fa8731f0f3 song-b6de8d283268f775 song-81c5402e788eb539 song-e3bbb9dda5c56040 song-0ab37f6aed2e8287',
    'song-70ec656f19060da0 song-ff84208dffabf03c song-a91fd4e8cf2472c9 song-88b6d48e183e085f song-bef6f2b4964ebf41 song-a4fcb1c1f5c03542 song-9e1fa717a4e3a5ca song-6d0a00845ddf6935',
    'song-17c56211cae57ee0',
  ].join(' ').split(' ');
  function hash(id){
    let value=2166136261;
    for(const character of id)value=Math.imul(value^character.codePointAt(0),16777619);
    return value>>>0;
  }
  const sortIds=(left,right)=>hash(left)-hash(right)||(left<right?-1:Number(left!==right));
  const legacyOrder=legacyIds.slice().sort(sortIds);
  const oldGroups=['tang-','song-'].map(prefix=>legacyOrder.filter(id=>id.startsWith(prefix)));
  const relative=(value,length)=>((value%length)+length)%length;

  function roster(poems){
    const byId=new Map();
    for(const poem of poems)if(poem&&typeof poem.id==='string'&&kinds.includes(poem.kind))byId.set(poem.id,poem.kind);
    return byId;
  }

  function legacy(day,poems){
    const offset=day-epoch;
    if(!Number.isInteger(day)||offset<0)return undefined;
    const byId=poems instanceof Map?poems:roster(poems);
    const classic=oldGroups[relative(offset,2)];
    const original=classic[Math.floor(offset/2)%classic.length];
    if(byId.has(original))return original;
    const ordered=[...byId.keys()].sort(sortIds);
    const group=ordered.filter(id=>byId.get(id)===kinds[relative(offset,2)]);
    return group.length?group[Math.floor(offset/2)%group.length]:ordered[offset%ordered.length];
  }

  function interleave(byId,first,previous){
    const ids=[...byId.keys()].filter(id=>id!==first).sort(sortIds);
    const tang=ids.filter(id=>byId.get(id)===kinds[0]),song=ids.filter(id=>byId.get(id)===kinds[1]);
    const bias=byId.get(first||previous)===kinds[1]?ids.length-tang.length:0;
    const queue=first?[first]:[];
    let tangIndex=0,songIndex=0;
    for(let step=0;step<ids.length;step++){
      const target=Math.floor(((step+1)*tang.length+bias)/ids.length);
      queue.push(target>tangIndex?tang[tangIndex++]:song[songIndex++]);
    }
    if(!first&&queue.length>1&&queue[0]===previous)queue.push(queue.shift());
    return queue;
  }

  function validState(saved){
    if(!saved||saved.version!==1||!Number.isInteger(saved.anchor)||saved.anchor<epoch||
      !Number.isInteger(saved.highWater)||saved.highWater<saved.anchor||!Array.isArray(saved.segments)||
      !saved.segments.length||saved.segments[0]?.start!==saved.anchor)return false;
    return saved.segments.every((segment,index)=>{
      if(!segment||!Number.isInteger(segment.start)||!Array.isArray(segment.order)||!segment.order.length||
        new Set(segment.order).size!==segment.order.length||!segment.order.every(id=>typeof id==='string'&&id.length))return false;
      if(!index)return true;
      const previous=saved.segments[index-1],distance=segment.start-previous.start;
      return distance>0&&distance%previous.order.length===0;
    });
  }

  function locate(segments,day){
    for(let index=segments.length-1;index>=0;index--)if(day>=segments[index].start)return segments[index];
    return null;
  }
  const sameRoster=(order,byId)=>order.length===byId.size&&order.every(id=>byId.has(id));

  function create(poems,installDay,saved){
    const byId=roster(poems);
    const requested=Number.isInteger(installDay)?Math.max(installDay,epoch):epoch;
    if(!byId.size)return {state:saved||null,idFor:()=>undefined,progress:()=>null};
    const old=validState(saved)?saved:null;
    const anchor=old?.anchor??requested;
    const highWater=Math.max(old?.highWater??requested,requested);
    let segments=old?old.segments.slice():[{start:anchor,order:interleave(byId,legacy(anchor,byId),null)}];
    if(!sameRoster(segments[segments.length-1].order,byId)){
      segments=segments.filter(segment=>segment.start<=highWater);
      const current=segments[segments.length-1];
      if(!sameRoster(current.order,byId)){
        const start=current.start+(Math.floor((highWater-current.start)/current.order.length)+1)*current.order.length;
        segments.push({start,order:interleave(byId,null,current.order[current.order.length-1])});
      }
    }
    return {
      state:{version:1,anchor,highWater,segments},
      idFor(day){
        if(!Number.isInteger(day))return undefined;
        const segment=locate(segments,day);
        if(!segment)return legacy(day,byId);
        return segment.order[relative(day-segment.start,segment.order.length)];
      },
      progress(day){
        const segment=locate(segments,day);
        return segment?{index:relative(day-segment.start,segment.order.length)+1,total:segment.order.length}:null;
      }
    };
  }
  window.PoetrySchedule={legacy,create};
})();
