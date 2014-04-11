UNIFI
=====

Delivery Mechanism: UNIFI

-------------------

Requirements: 
  - The module 'api'
  - The modules'core/usermanagement', 'core/config', 'core/aaa' and 'native' must be deployed

  - if all projects are cloned, execute:
cd api/; git pull; mvn clean install; cd -; cd core/ git pull; mvn clean install wildfly:deploy; cd -; cd native/; git pull; mvn clean wildfly:deploy; cd -; cd unifi/; git pull; mvn clean wildfly:deploy; cd -; 

  - afterwards the UNIFI-GUI should be visible under http://localhost:8080/unifi/






