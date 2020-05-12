import { DialogWindow, ConfirmMode } from "./dialogWindow"
import { Robot, RobotID } from "./robot"
import resources from "../resources"
import utils from "../../node_modules/decentraland-ecs-utils/index"
import { TrackUserSlerp } from "./faceUserSystem"

/*
  Main = 0 (Alice)
  Shell = 1 (Ron)
  Agora = 2 (Bela)
  Garden = 3 (Betty)
  Trade = 4 (Charlie)
  Artichoke = 5 (Marsha)
  Whale = 6 (Bob)
*/

export const robots: Robot[] = []

export function addRobots(dummyTarget: Entity) {
  // Robots
  const ringShape = resources.models.robots.rings

  const alice = new Robot(
    resources.models.robots.alice,
    new Transform({
      position: new Vector3(155, 2.25, 159),
      rotation: Quaternion.Euler(0, 150, 0),
    }),
    RobotID.Main
  )
  robots.push(alice)
  const aliceRings = new Entity()
  aliceRings.addComponent(ringShape)
  aliceRings.addComponent(
    new Transform({
      position: new Vector3(0, -0.65, 0),
    })
  )
  aliceRings.setParent(alice)

  const ron = new Robot(
    resources.models.robots.ron,
    new Transform({
      position: new Vector3(297, 11.365, 123),
      rotation: Quaternion.Euler(0, -110, 0),
    }),
    RobotID.Shell
  )
  robots.push(ron)

  const bela = new Robot(
    resources.models.robots.bela,
    new Transform({
      position: new Vector3(37.27, 3.65, 265.32),
      rotation: Quaternion.Euler(0, 90, 0),
    }),
    RobotID.Agora
  )
  robots.push(bela)

  const betty = new Robot(
    resources.models.robots.betty,
    new Transform({
      position: new Vector3(117.657, 3.6, 39.98),
    }),
    RobotID.Garden
  )
  robots.push(betty)

  const charlie = new Robot(
    resources.models.robots.charlie,
    new Transform({
      position: new Vector3(269.5, 5.35, 42.6),
      rotation: Quaternion.Euler(0, -90, 0)
    }),
    RobotID.Trade
  )
  robots.push(charlie)
  const charlieRings = new Entity()
  charlieRings.addComponent(ringShape)
  charlieRings.addComponent(
    new Transform({
      position: new Vector3(0, -0.55, 0),
    })
  )
  charlieRings.setParent(charlie)

  const marsha = new Robot(
    resources.models.robots.marsha,
    new Transform({
      position: new Vector3(50.945, 9.65, 31.10),
    }),
    RobotID.Artichoke
  )
  robots.push(marsha)

  const bob = new Robot(
    resources.models.robots.bob,
    new Transform({
      position: new Vector3(171, 11.5, 263.435),
      rotation: Quaternion.Euler(0, 215, 0)
    }),
    RobotID.Whale
  )
  robots.push(bob)
  const bobRings = new Entity()
  bobRings.addComponent(ringShape)
  bobRings.addComponent(
    new Transform({
      position: new Vector3(0, -0.65, -0.075),
    })
  )
  bobRings.setParent(bob)

  // UI elements
  const canvas = new UICanvas()
  const dialogWindow = new DialogWindow(canvas)

  // ISSUE: Modules do not load when these components are refactored to be part of the Robot class
  // Add user interaction
  for (let i = 0; i < robots.length; i++) {
    robots[i].addComponent(
      new OnPointerDown(
        (): void => {

          let isGoodbyePlaying =  robots[i].getComponent(Animator).getClip("Goodbye").playing

          if (!dialogWindow.isDialogOpen && !isGoodbyePlaying) {
            robots[i].playHello()
            robots[i].getComponent(AudioSource).playOnce()
            dialogWindow.openDialogWindow(robots[i].robotID, 0)
            dummyTarget.getComponent(Transform).position = robots[
              i
            ].getComponent(Transform).position
            if (!robots[i].hasComponent(TrackUserSlerp))
              robots[i].addComponent(new TrackUserSlerp())
          }
        },
        {
          button: ActionButton.POINTER,
          showFeedback: true,
          hoverText: "Talk",
          distance: resources.trigger.triggerShape.radius,
        }
      )
    )
    robots[i].addComponent(
      new utils.TriggerComponent(
        resources.trigger.triggerShape, //shape
        0, //layer
        0, //triggeredByLayer
        null, //onTriggerEnter
        null, //onTriggerExit
        null, //onCameraEnter
        () => {
          log("exit trigger area")
          dialogWindow.closeDialogWindow()
        }, //onCameraExit
        false // enableDebug
      )
    )
  }

  // Global button events for progressing the dialog
  const input = Input.instance

  input.subscribe("BUTTON_DOWN", ActionButton.POINTER, false, (): void => {
    log("LMB Clicked")
    if (dialogWindow.isDialogOpen && !dialogWindow.isQuestionPanel) {
      dialogWindow.confirmText(ConfirmMode.Next)
    }
  })

  input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, (): void => {
    log("E Key Pressed")
    if (dialogWindow.isDialogOpen && dialogWindow.isQuestionPanel) {
      dialogWindow.confirmText(ConfirmMode.Confirm)
    }
  })

  input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, (): void => {
    log("F Key Pressed")
    if (dialogWindow.isDialogOpen && dialogWindow.isQuestionPanel) {
      dialogWindow.confirmText(ConfirmMode.Cancel)
    }
  })
}