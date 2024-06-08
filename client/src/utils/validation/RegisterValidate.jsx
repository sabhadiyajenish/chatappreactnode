const userNameValidate = {

    required: {
        value: true,
        message: "UserName is Required."
    },
    minLength: {
        value: 6,
        message: "UserName should be at-least 6 characters."
    },
    maxLength: {
        value: 100,
        message: "UserName maximum 100 characters."
    },

}

const fullNameValidate = {
    required: {
        value: true,
        message: "FullName is Required."
    },
    minLength: {
        value: 4,
        message: "FullName should be at-least 6 characters."
    },
    maxLength: {
        value: 100,
        message: "FullName maximum 100 characters."
    },
}
const EmailValidate = {
    required: {
        value: true,
        message: "Email is Required."
    },
    pattern: {
        value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
        message: "Email is not valid."
    }
}
const PasswordValidate = {
    required: {
        value: true,
        message: "PassWord is Required."
    },
    validate: {
        checkLength: (value) => value.length >= 5,
        matchPattern: (value) =>
            /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)(?=.*[!@#$*])/.test(
                value
            )
    }
}
const ProfileValidate = {
    required: {
        value: true,
        message: "Image is Required."
    }, // for making the input required
    validate: {
        // If you want other file format, then add them to the array
        fileType: file => ["jpg", "png", "jpeg"].includes(file[0]?.type?.split("/")[1].toLowerCase()) || "The file type should be Image",

        fileSize: file => file[0].size / (1024 * 1024) < 5 || "The file size should be less than 5MB"
        //Add other validation if you want. For example, checking for file size

    }
}

export { userNameValidate, fullNameValidate, EmailValidate, PasswordValidate, ProfileValidate };