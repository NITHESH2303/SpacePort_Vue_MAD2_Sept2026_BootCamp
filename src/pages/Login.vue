<template>
    <h2>SpacePort Login</h2>

    <input v-model="username" placeholder="enter you username" /> <br>
    <input v-model="password" placeholder="Password" /> <br>
    <button @click="handleLogin">Sign In</button>
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>

</template>
<script>
  export default {
      name: 'Login',
      data()
      {
        return {
            username: '',
            password: '',
            errorMessage: ''
        }
      },
      methods: {
        async handleLogin() {
            try
            {
                const response = await fetch('http://127.0.0.1:5000/login',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                });

                const data = await response.json();
                console.log("received data: ", data)
                if(response.ok)
                {
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('roles', JSON.stringify(data.roles));

                    this.$router.push('/home')
                }
                else
                {
                    alert(data.message || 'Login Failed')
                }
            }
            catch(err)
            {
                this.errorMessage = 'Something went wrong!!!'
            }
        },
        
      }
  }
</script>