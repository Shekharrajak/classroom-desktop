jest.unmock("../cloneutils.js")

import { clone } from "../cloneutils.js"
import rmdir from "rimraf"

const fs = require("fs")

const TEST_REPO = "https://github.com/education/classroom-desktop"
const TEST_FAKE_REPO = "https://github.com/education/a-repo-that-will-never-exist"

const DESTINATION = "/tmp/" + Math.random().toString(36).substring(7)

describe("Clone Utilities", () => {
  describe("clone", () => {
    const removeTestDir = (done) => {
      rmdir(DESTINATION, () => {
        done()
      })
    }

    beforeEach(removeTestDir)
    afterEach(removeTestDir)

    it("clones the repository to the correct destination", (done) => {
      clone(
        TEST_REPO,
        DESTINATION,
        (percentage) => {}
      ).then(() => {
        const stats = fs.lstatSync(DESTINATION)
        expect(stats.isDirectory()).toBe(true)
        done()
      })
    })

    it("notifies when the repo is 0% downloaded", (done) => {
      const statusCallback = jest.fn()

      clone(
        TEST_REPO,
        DESTINATION,
        statusCallback
      ).then(() => {
        expect(statusCallback.mock.calls[0][0]).toBe(0)
        done()
      })
    })

    it("notifies when the repo is 100% downloaded", (done) => {
      const statusCallback = jest.fn()

      clone(
        TEST_REPO,
        DESTINATION,
        statusCallback
      ).then(() => {
        expect(statusCallback.mock.calls[statusCallback.mock.calls.length - 1][0]).toBe(100)
        done()
      })
    })

    it("throws an error when cloning a repo that doesn't exist", (done) => {
      clone(
        TEST_FAKE_REPO,
        DESTINATION,
        () => {}
      ).then(() => {
        fail("Clone should not succeed")
      }).catch((err) => {
        console.log(err)
        done()
      })
    })

    it("throws an error when cloning a repo to an existing non-empty directory", (done) => {
      clone(
        TEST_REPO,
        DESTINATION,
        () => {}
      ).then(() => {
        return clone(
          TEST_REPO,
          DESTINATION,
          () => {}
        )
      }).then(() => {
        fail("Clone should not succeed")
      }).catch((err) => {
        console.log(err)
        done()
      })
    })
  })
})
